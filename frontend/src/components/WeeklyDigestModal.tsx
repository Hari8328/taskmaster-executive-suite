import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle2, Award, Zap, BookOpen } from 'lucide-react';
import * as d3 from 'd3';
import { Task } from '../types';

interface WeeklyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  stats: {
    upcoming: number;
    inProgress: number;
    completed: number;
  };
}

interface DayData {
  dateLabel: string;
  dayName: string;
  dateObj: Date;
  completedCount: number;
  focusMinutes: number;
}

export default function WeeklyDigestModal({ isOpen, onClose, tasks, stats }: WeeklyDigestModalProps) {
  
  // Safe tasks handler
  const safeTasks = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);

  // Filter completed tasks
  const completedTasks = useMemo(() => {
    return safeTasks.filter(t => t.status?.toLowerCase() === 'completed');
  }, [safeTasks]);

  // Group data by past 7 days (including today)
  const last7DaysData = useMemo<DayData[]>(() => {
    const data: DayData[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      // Label as short weekday (e.g., "Mon") and numerical date (e.g., "13 Jun")
      const dayNameShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayAndMonth = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const label = `${dayNameShort}\n${d.getDate()}`; // structured label

      // Filter tasks completed on this specific day
      const dayCompletions = completedTasks.filter(t => {
        if (!t.completedAt) return false;
        const compDate = new Date(t.completedAt);
        compDate.setHours(0, 0, 0, 0);
        return compDate.getTime() === d.getTime();
      });

      // Filter focus time spent on completions for this specific day
      const dayFocusMs = dayCompletions.reduce((sum, t) => {
        if (t.startedAt && t.completedAt) {
          const s = new Date(t.startedAt).getTime();
          const e = new Date(t.completedAt).getTime();
          return sum + Math.max(0, e - s);
        }
        return sum;
      }, 0);

      data.push({
        dateLabel: dayNameShort,
        dayName: dayAndMonth,
        dateObj: d,
        completedCount: dayCompletions.length,
        focusMinutes: Math.round(dayFocusMs / (1000 * 60))
      });
    }
    return data;
  }, [completedTasks]);

  // Overall calculations for past 7 days versus 7 days before
  const weeklySummary = useMemo(() => {
    const totalCompletions = last7DaysData.reduce((sum, d) => sum + d.completedCount, 0);
    const totalFocusMinutes = last7DaysData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const avgFocusMinutesPerDay = Math.round(totalFocusMinutes / 7);

    // Prior week completions
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const completedPriorWeek = completedTasks.filter(t => {
      if (!t.completedAt) return false;
      const age = Date.now() - new Date(t.completedAt).getTime();
      return age > oneWeekMs && age <= 2 * oneWeekMs;
    }).length;

    let growthPct = 0;
    if (completedPriorWeek === 0) {
      growthPct = totalCompletions > 0 ? totalCompletions * 100 : 0;
    } else {
      growthPct = Math.round(((totalCompletions - completedPriorWeek) / completedPriorWeek) * 100);
    }

    return {
      totalCompletions,
      totalFocusMinutes,
      avgFocusMinutesPerDay,
      growthPct,
      completedPriorWeek
    };
  }, [last7DaysData, completedTasks]);

  // Category Distribution
  const categoryData = useMemo(() => {
    const counts: { [cat: string]: number } = {};
    completedTasks.forEach(t => {
      const cat = t.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    return Object.keys(counts).map(cat => ({
      category: cat,
      count: counts[cat]
    })).sort((a, b) => b.count - a.count);
  }, [completedTasks]);

  // D3 Hooks
  const completedSvgRef = useRef<SVGSVGElement | null>(null);
  const focusSvgRef = useRef<SVGSVGElement | null>(null);
  const pieSvgRef = useRef<SVGSVGElement | null>(null);

  // Chart 1: Tasks Completed Bar Chart
  useEffect(() => {
    if (!completedSvgRef.current || !isOpen) return;

    const data = last7DaysData;
    const width = 480;
    const height = 180;
    const margin = { top: 25, right: 15, bottom: 30, left: 25 };

    const svg = d3.select(completedSvgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    svg.selectAll('*').remove();

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.dateLabel))
      .range([margin.left, width - margin.right])
      .padding(0.35);

    const maxCount = d3.max(data, d => d.completedCount) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(4, maxCount + 1)])
      .range([height - margin.bottom, margin.top]);

    // Gridlines Y-axis
    svg.append('g')
      .attr('class', 'opacity-10')
      .selectAll('line')
      .data(yScale.ticks(4))
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#000000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Axes
    const xAxis = d3.axisBottom(xScale).tickSize(3);
    const yAxis = d3.axisLeft(yScale).ticks(3).tickSize(3).tickFormat(d3.format('d'));

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('class', 'text-[10px] font-mono text-editorial-muted')
      .select('.domain').attr('stroke', '#e2e8f0');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('class', 'text-[10px] font-mono text-editorial-muted')
      .select('.domain').attr('stroke', '#e2e8f0');

    // Draw Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'fill-editorial-ink/90 hover:fill-editorial-ink transition-colors cursor-pointer')
      .attr('x', d => xScale(d.dateLabel) || 0)
      .attr('y', d => yScale(d.completedCount))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.completedCount))
      .attr('rx', 2);

    // Add values on top of bars
    svg.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', d => (xScale(d.dateLabel) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.completedCount) - 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[9px] font-mono font-bold fill-editorial-ink')
      .text(d => d.completedCount > 0 ? d.completedCount : '0');

  }, [last7DaysData, isOpen]);

  // Chart 2: Focus Minutes Area/Line Chart
  useEffect(() => {
    if (!focusSvgRef.current || !isOpen) return;

    const data = last7DaysData;
    const width = 480;
    const height = 180;
    const margin = { top: 25, right: 15, bottom: 30, left: 35 };

    const svg = d3.select(focusSvgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    svg.selectAll('*').remove();

    // Scales
    const xScale = d3.scalePoint()
      .domain(data.map(d => d.dateLabel))
      .range([margin.left, width - margin.right]);

    const maxFocus = d3.max(data, d => d.focusMinutes) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(30, maxFocus + 10)])
      .range([height - margin.bottom, margin.top]);

    // Gridlines (Horizontal)
    svg.append('g')
      .attr('class', 'opacity-10')
      .selectAll('line')
      .data(yScale.ticks(4))
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#000000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Axes
    const xAxis = d3.axisBottom(xScale).tickSize(3);
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d => `${d}m`).tickSize(3);

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('class', 'text-[10px] font-mono text-editorial-muted')
      .select('.domain').attr('stroke', '#e2e8f0');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('class', 'text-[10px] font-mono text-editorial-muted')
      .select('.domain').attr('stroke', '#e2e8f0');

    // Gradient definitions inside SVG
    const gradientId = 'focus-weekly-gradient';
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.25);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.0);

    // Generators
    const lineGen = d3.line<DayData>()
      .x(d => xScale(d.dateLabel) || 0)
      .y(d => yScale(d.focusMinutes))
      .curve(d3.curveMonotoneX);

    const areaGen = d3.area<DayData>()
      .x(d => xScale(d.dateLabel) || 0)
      .y0(height - margin.bottom)
      .y1(d => yScale(d.focusMinutes))
      .curve(d3.curveMonotoneX);

    // Draw area
    svg.append('path')
      .datum(data)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', areaGen);

    // Draw line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', lineGen);

    // Render interactive circles
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.dateLabel) || 0)
      .attr('cy', d => yScale(d.focusMinutes))
      .attr('r', 4.5)
      .attr('class', 'fill-white stroke-brand-blue stroke-[2px] transition-transform duration-200 cursor-pointer hover:scale-130');

    // Text labels overlay
    svg.selectAll('.focus-value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.dateLabel) || 0)
      .attr('y', d => yScale(d.focusMinutes) - 7)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[8.5px] font-mono font-bold fill-brand-blue')
      .text(d => d.focusMinutes > 0 ? `${d.focusMinutes}m` : '');

  }, [last7DaysData, isOpen]);

  // Chart 3: Category Distribution Donut Chart
  useEffect(() => {
    if (!pieSvgRef.current || !isOpen || categoryData.length === 0) return;

    const data = categoryData.slice(0, 5); // limit to top 5 categories
    const width = 160;
    const height = 160;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(pieSvgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Harmonious modern editorial-ink palette
    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.category))
      .range(['#1e293b', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#64748b']);

    const pie = d3.pie<any>()
      .value(d => d.count)
      .sort(null);

    const path = d3.arc<any>()
      .outerRadius(radius - 8)
      .innerRadius(radius - 24);

    const arcOver = d3.arc<any>()
      .outerRadius(radius - 4)
      .innerRadius(radius - 24);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', path)
      .attr('fill', d => color(d.data.category)!)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-300 cursor-pointer')
      .on('mouseenter', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arcOver);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', path);
      });

    // Center total metrics count text
    const grandTotal = d3.sum(categoryData, d => d.count);
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-3px')
      .attr('class', 'text-[8.5px] font-mono uppercase fill-slate-400 font-semibold tracking-wider')
      .text('Archives');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '14px')
      .attr('class', 'text-xl font-serif font-serif italic font-bold fill-editorial-ink')
      .text(grandTotal);

  }, [categoryData, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-editorial-paper border border-editorial-border w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 rounded-sm font-sans flex flex-col"
            id="weekly-digest-modal-container"
          >
            
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-editorial-border px-6 py-5 shrink-0 bg-editorial-paper">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-editorial-ink text-editorial-paper rounded-full">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-serif italic text-editorial-ink font-bold leading-tight">Weekly Performance Digest</h3>
                  <p className="text-[10px] font-mono text-editorial-muted uppercase tracking-widest mt-0.5">Focus Metrology & Progress Metrics</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 border border-editorial-border hover:bg-editorial-muted/10 text-editorial-muted hover:text-editorial-ink transition-colors rounded-full"
                title="Dismiss Digest"
                id="weekly-digest-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Container */}
            <div className="p-6 md:p-8 space-y-8 flex-1 overflow-x-hidden">

              {/* Top Summary Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Completed Tasks count */}
                <div className="border border-editorial-border p-4 flex flex-col justify-between">
                  <span className="font-mono text-[10px] uppercase text-editorial-muted tracking-wider block">Completed Tasks</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-serif font-bold text-editorial-ink">
                      {weeklySummary.totalCompletions < 10 ? `0${weeklySummary.totalCompletions}` : weeklySummary.totalCompletions}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded flex items-center">
                      <CheckCircle2 size={10} className="mr-1 text-green-600" />
                      7d Total
                    </span>
                  </div>
                </div>

                {/* 2. Total focus time logged */}
                <div className="border border-editorial-border p-4 flex flex-col justify-between">
                  <span className="font-mono text-[10px] uppercase text-editorial-muted tracking-wider block">Total Focus Work</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-serif font-bold text-editorial-ink">
                      {weeklySummary.totalFocusMinutes > 60 
                        ? `${Math.floor(weeklySummary.totalFocusMinutes / 60)}h ${weeklySummary.totalFocusMinutes % 60}m` 
                        : `${weeklySummary.totalFocusMinutes}m`}
                    </span>
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center">
                      <Clock size={10} className="mr-1" />
                      Shielded
                    </span>
                  </div>
                </div>

                {/* 3. Daily Mean Focus Duration */}
                <div className="border border-editorial-border p-4 flex flex-col justify-between">
                  <span className="font-mono text-[10px] uppercase text-editorial-muted tracking-wider block">Avg Daily Flow</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-serif font-bold text-editorial-ink">
                      {weeklySummary.avgFocusMinutesPerDay}m <span className="text-xs font-serif italic text-editorial-muted">/ day</span>
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                      Consistent
                    </span>
                  </div>
                </div>

                {/* 4. Weekly growth Index */}
                <div className={`border p-4 flex flex-col justify-between transition-colors ${
                  weeklySummary.growthPct >= 0 
                    ? 'border-emerald-200 bg-emerald-50/25' 
                    : 'border-orange-200 bg-orange-50/25'
                }`}>
                  <span className="font-mono text-[10px] uppercase text-editorial-muted tracking-wider block">Growth Index</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-3xl font-serif font-black ${
                        weeklySummary.growthPct >= 0 ? 'text-emerald-700' : 'text-orange-700'
                      }`}>
                        {weeklySummary.growthPct >= 0 ? '+' : ''}{weeklySummary.growthPct}%
                      </span>
                      {weeklySummary.growthPct >= 0 ? (
                        <TrendingUp size={16} className="text-emerald-600" />
                      ) : (
                        <TrendingDown size={16} className="text-orange-600" />
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight">
                      vs prior 7 days
                    </span>
                  </div>
                </div>

              </div>

              {/* Main D3 Charts Area Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Chart 1 container: Completed Tasks */}
                <div className="border border-editorial-border bg-white p-5 space-y-4 rounded-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center space-x-1.5">
                      <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                      <span>Task Completion Velocity</span>
                    </h4>
                    <p className="text-[11px] text-editorial-muted italic font-serif leading-relaxed mt-1">
                      Visualizing daily completed task counts across the past 7 days to evaluate project throughput constraints.
                    </p>
                  </div>
                  <div className="w-full h-48 flex items-end justify-center relative pl-2 pt-2">
                    {weeklySummary.totalCompletions === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[1px] p-4 text-center z-10 rounded">
                        <BookOpen size={18} className="text-slate-400 mb-1" />
                        <span className="text-[11px] font-mono text-slate-500 uppercase font-black">Velocity Engine Sleep</span>
                        <span className="text-[10px] text-slate-500 font-serif italic mt-0.5">Complete a task to unlock the D3 activity graphs!</span>
                      </div>
                    )}
                    <svg ref={completedSvgRef} className="w-full h-full" id="weekly-digest-tasks-svg" />
                  </div>
                </div>

                {/* Chart 2 container: Focus Duration */}
                <div className="border border-editorial-border bg-white p-5 space-y-4 rounded-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center space-x-1.5">
                      <Clock size={14} className="text-blue-600 shrink-0" />
                      <span>Shielded Focus Velocity</span>
                    </h4>
                    <p className="text-[11px] text-editorial-muted italic font-serif leading-relaxed mt-1">
                      Tracking accumulative daily deep work time spend (in minutes) to understand attention discipline endurance.
                    </p>
                  </div>
                  <div className="w-full h-48 flex items-end justify-center relative pl-2 pt-2">
                    {weeklySummary.totalFocusMinutes === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[1px] p-4 text-center z-10 rounded">
                        <Zap size={18} className="text-slate-400 mb-1" />
                        <span className="text-[11px] font-mono text-slate-500 uppercase font-black">Acoustic Shield Offline</span>
                        <span className="text-[10px] text-slate-500 font-serif italic mt-0.5">Begin a Deep Focus session to chart focus minutes!</span>
                      </div>
                    )}
                    <svg ref={focusSvgRef} className="w-full h-full" id="weekly-digest-focus-svg" />
                  </div>
                </div>

              </div>

              {/* Lower Section: Category Breakdown + Educational Insight Banners */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
                
                {/* Category Donut chart and breakdown list */}
                <div className="md:col-span-5 border border-editorial-border p-5 rounded-sm flex flex-col justify-between bg-white">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-slate-700 font-semibold mb-1">Architecture Spread</h4>
                    <p className="text-[10.5px] text-slate-400 font-serif italic leading-relaxed">Top categories of completed tasks</p>
                  </div>

                  {categoryData.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 mt-4">
                      <div className="shrink-0">
                        <svg ref={pieSvgRef} className="w-40 h-40" id="weekly-digest-category-pie" />
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        {categoryData.slice(0, 3).map((item, idx) => {
                          const colors = ['bg-slate-800', 'bg-blue-600', 'bg-emerald-500'];
                          return (
                            <div key={item.category} className="flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center space-x-2 truncate pr-2">
                                <span className={`w-2 h-2 rounded-full ${colors[idx] || 'bg-slate-400'} shrink-0`} />
                                <span className="text-slate-700 font-bold truncate">{item.category}</span>
                              </div>
                              <span className="text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 font-serif italic">
                      No categories found in archival completed items.
                    </div>
                  )}
                </div>

                {/* Productivity insights column */}
                <div className="md:col-span-7 border border-editorial-border p-5 rounded-sm bg-editorial-ink text-editorial-paper flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                    <Award size={200} />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 border border-white/20 rounded-full text-[9px] font-mono tracking-widest uppercase text-yellow-400 font-bold">
                      <Award size={12} className="mr-1" />
                      <span>Flow Metric Insight</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-serif italic font-bold leading-snug">
                        {weeklySummary.growthPct >= 0 
                          ? 'You are expanding your cognitive throughput velocity!' 
                          : 'Your cognitive work buffer requires tuning.'}
                      </h4>
                      <p className="text-xs text-editorial-paper/85 leading-relaxed font-serif italic">
                        {weeklySummary.growthPct >= 0 
                          ? `With a growth rate of +${weeklySummary.growthPct}% in completions, your consistency score indicates high mental endurance. Your structured execution, paired with immersive Deep Focus, has neutralized potential attention fatigue.`
                          : `Completions fell slightly back by ${Math.abs(weeklySummary.growthPct)}% vs the prior 7-day period. This is completely standard during recovery phases. Consider leveraging shorter pomodoro intervals (25-minute sprints with guided box breathing) to smoothly restart momentum.`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-[10px] font-mono text-editorial-paper/60 uppercase tracking-widest">
                    <span>Performance Rating: {weeklySummary.totalCompletions >= 4 ? 'A+' : 'Steady Progress'}</span>
                    <span>System Sync Verified</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer control row */}
            <div className="border-t border-editorial-border px-6 py-4 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-editorial-ink text-editorial-paper text-xs font-mono uppercase tracking-widest hover:bg-slate-850 hover:text-white transition-colors rounded-sm font-bold shadow-sm"
                id="weekly-digest-dismiss-bottom-btn"
              >
                Dismiss Performance Archive
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
