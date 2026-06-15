export interface InspirationMentor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  quotes: string[];
  achievements: string[];
  inspiration: string;
  questions: string[];
  jerseyNumber?: string;
}

export const INSPIRATION_MENTORS: InspirationMentor[] = [
  {
    id: 'steve_jobs',
    name: 'Steve Jobs',
    title: 'Co-founder of Apple & Pixar',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/d/dc/Steve_Jobs_Headshot_2010-CROP.jpg&w=200&h=200&fit=cover',
    bio: 'Revolutionized technology, design, and user experience, championing the blend of humanities and sciences.',
    quotes: [
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
      "Innovation distinguishes between a leader and a follower.",
      "My favorite things in life don't cost any money. It's really clear that the most precious resource we all have is time.",
      "Have the courage to follow your heart and intuition. They somehow already know what you truly want to become."
    ],
    achievements: [
      "Co-founded Apple and revolutionized personal computers, music, cellular phones, tablets, and digital publishing.",
      "Pioneered the graphical user interface (GUI) and elegant desktop typography with the original Macintosh.",
      "Acquired and built Pixar Animation Studios into a creative powerhouse, releasing the first completely CGI film, Toy Story."
    ],
    inspiration: "After being publicly ousted from Apple, the very company he founded, Jobs didn't quit. Instead, he founded NeXT and Pixar, using his most creative decade to build the foundations of technologies that would later power his triumphant return to save Apple from bankruptcy.",
    questions: [
      "Did you focus on the absolute polish and detail in this task today?",
      "Are you prioritizing what really matters, or just staying busy with noise?",
      "How can you challenge traditional boundaries in your next session?"
    ]
  },
  {
    id: 'virat_kohli',
    name: 'Virat Kohli',
    title: 'Modern Cricket Legend & Chase Master',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_West_Indies_one_day_international_cricket_match_at_Queens_Park_Oval%2C_Port_of_Spain%2C_Trinidad_and_Tobago_%28cropped%29.jpg&w=200&h=200&fit=cover',
    jerseyNumber: '18',
    bio: 'One of the greatest batsmen in modern cricket history, famous for his extreme passion, fitness obsession, and unmatched chasing efficiency.',
    quotes: [
      "Self-belief and hard work will always earn you success.",
      "If you can stay steady under immense pressure, the pressure eventually shifts onto the opposition.",
      "I love to tackle pressure. Without pressure, there is no fun in achieving milestones in life.",
      "Whatever you want to do, do it with absolute passion and work as hard as you can."
    ],
    achievements: [
      "Held the ICC number one ODI ranking for 1,258 consecutive days, demonstrating flawless long-term dominance.",
      "Scored more than 50 One Day International centuries, breaking the legendary record previously held by Sachin Tendulkar.",
      "Led India to their historic first-ever Test series victory in Australia as dynamic captain with elite standards."
    ],
    inspiration: "Early in his career, Virat lost his father during a critical Ranji Trophy state match. Despite the massive heartbreak, he returned to the field the next morning to play a match-saving innings of 90 for his team before attending his father's funeral, cementing his legendary self-discipline.",
    questions: [
      "Are you attacking your current objective with maximum focus and self-belief?",
      "Did you maintain your intensity and pride from start to finish?",
      "How can you raise your fitness, focus, or personal standards for the next task?"
    ]
  },
  {
    id: 'cristiano_ronaldo',
    name: 'Cristiano Ronaldo',
    title: 'All-Time Football Icon & Elite Athlete',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018_%28cropped%29.jpg&w=200&h=200&fit=cover',
    jerseyNumber: '7',
    bio: 'Renowned globally for his ultimate physical conditioning, unparalleled mental resilience, and relentless obsession with professional perfection.',
    quotes: [
      "Your love makes me strong, your hate makes me unstoppable.",
      "I am living a dream I never want to wake up from.",
      "Talent without hard work is nothing. You must practice every single day.",
      "I am not a perfectionist, but I like to feel that things are done well."
    ],
    achievements: [
      "All-time leading goal scorer in UEFA Champions League history and international men's association football.",
      "Won five Ballon d'Or awards and four European Golden Shoes across legendary careers in England, Spain, and Italy.",
      "Led Portugal as captain to their historic first-ever major international crown at UEFA Euro 2016."
    ],
    inspiration: "Ronaldo grew up in a very poor, working-class home in Madeira, sharing a single room with his siblings. At age 15, he was diagnosed with a racing heart, a condition that could have ended his sports life. He underwent heart laser surgery, rested for just a few days, and immediately resumed intense training.",
    questions: [
      "Did you invest and push with extraordinary elite effort on this task?",
      "How are you building your daily focus habits to make sure talent matches hard work?",
      "Are you utilizing setbacks or criticisms as fuel to grow stronger?"
    ]
  },
  {
    id: 'lionel_messi',
    name: 'Lionel Messi',
    title: 'World Champion & Football Genius',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg&w=200&h=200&fit=cover',
    jerseyNumber: '10',
    bio: 'Widely regarded as the greatest football player of all time, famous for his effortless dribbling, outstanding spatial vision, and natural genius.',
    quotes: [
      "It took me 17 years and 114 days to become an overnight success.",
      "You have to fight to reach your dream. You have to sacrifice and work hard for it.",
      "I prefer to win titles with the team rather than individual awards of praise.",
      "The best decisions aren't made with your mind, but with your instinct."
    ],
    achievements: [
      "Won a record eight Ballon d'Or awards and six European Golden Shoes across a legendary career.",
      "Led Argentina to triumph at the 2022 FIFA World Cup, winning the Golden Ball as the tournament's best player.",
      "Holds the world record for the most goals in a single calendar year, scoring an unbelievable 91 goals in 2012."
    ],
    inspiration: "Messi was diagnosed with a growth hormone deficiency as a young child in Argentina. Lacking the funds to pay for his medical therapy, he left his home to move across the Atlantic to Barcelona, knowing that only sheer genius on the pitch would secure the contract that saved his health.",
    questions: [
      "How did you find simple, elegant solutions to complicated problems today?",
      "Are you staying humble and prioritizing team/overall goals over individual praise?",
      "Do you keep your joy and passion alive even during repetitive daily work?"
    ]
  },
  {
    id: 'rohit_sharma',
    name: 'Rohit Sharma',
    title: 'Indian Captain & Cricketing "Hitman"',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/1/1e/Rohit_Sharma_at_press_conference_during_the_ICC_Cricket_World_Cup_2019_%28cropped%29.jpg&w=200&h=200&fit=cover',
    jerseyNumber: '45',
    bio: 'Famous for his elegant timing, pull shots, record-setting double centuries, and leading India to the 2024 ICC T20 World Cup title with outstanding tactical calm.',
    quotes: [
      "You need to trust your preparation. Once you step onto the field, it is all about natural instinct.",
      "I don't look back at what has happened. I am focused entirely on what we can do next.",
      "When you play for your country, every single run you score, every contribution you play, is an absolute honor.",
      "If you stay calm and clear in your head, the timing will follow naturally."
    ],
    achievements: [
      "Only cricketer ever to score three double centuries (including the world-record 264) in One Day International history.",
      "Led India to the historic 2024 ICC Men's T20 World Cup championship as captain, undefeated throughout the tournament.",
      "Led Mumbai Indians to an outstanding five Indian Premier League (IPL) championships as captain."
    ],
    inspiration: "In 2011, Rohit suffered a devastating blow when he was omitted from India's home World Cup squad. Instead of complaining, he used the setback to completely reinvent his mindset and game, transitioning from a volatile middle-order batsman into the world's most dominant and composed white-ball opening batsman.",
    questions: [
      "Did you trust your preparation and tackle this task with relaxed confidence today?",
      "How can you simplify your approach to build elegant timing and efficiency?",
      "How did you handle the most challenging phase of this task without panic?"
    ]
  },
  {
    id: 'ms_dhoni',
    name: 'M. S. Dhoni',
    title: 'Legendary Cricket Captain & Process-Master',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/a/ad/Mahendra_Singh_Dhoni_January_2016.jpg&w=200&h=200&fit=cover',
    jerseyNumber: '7',
    bio: 'Renowned globally for his extreme mental composure under intense pressure, quick decisions, and steady dedication to daily execution rules.',
    quotes: [
      "If you don't really have a dream, you can't really push yourself.",
      "Process is more important than the results. If you take care of the process, you will get the results.",
      "I believe in quiet hard work. You don't need to shout to show your commitment.",
      "Staying calm under intense pressure is not about ignoring fear, it's about channeling focus."
    ],
    achievements: [
      "Only captain in cricketing history to win all three ICC white-ball global trophies (T20 World Cup, 50-over World Cup, and Champions Trophy).",
      "Pioneered modern wicket-keeping speeds and built a reputation as the world's greatest cold-headed match finisher.",
      "Led transitions of multiple generation rosters with quiet humbleness, always handing the trophy to youngsters."
    ],
    inspiration: "Starting as a modest railway ticket examiner in a small town, Dhoni spent years balancing grinding ticket counter shifts, exhausting physical platform labor, and strenuous late-night training on dusty outfields before breaking onto the world stage.",
    questions: [
      "Did you focus entirely on executing your process smoothly, rather than worrying about the ultimate output?",
      "How composed did you stay when handling setbacks during this session?",
      "Are you maintaining a calm, long-term mindset for the challenges still ahead?"
    ]
  },
  {
    id: 'lebron_james',
    name: 'LeBron James',
    title: 'NBA Legend & Longevity Icon',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/d/df/LeBron_James_Governors_Ball_2018.jpg&w=200&h=200&fit=cover',
    jerseyNumber: '23',
    bio: 'One of the greatest basketball players in history, renowned for his generational longevity, absolute durability, and deep analytical mind.',
    quotes: [
      "You have to be able to accept failure to get better.",
      "Every night on the court I give my all, and if I am not giving 100%, I criticize myself first.",
      "Nothing is given. Everything is earned. You work for what you have.",
      "I like criticism. It makes you keep pushing."
    ],
    achievements: [
      "The NBA's all-time leading scorer, breaking historical records with unmatched consistency.",
      "Won four NBA championships with three different franchises, earning Finals MVP honors in each.",
      "Four-time NBA regular season MVP and three-time Olympic gold medalist representing Team USA."
    ],
    inspiration: "Raised by a single teenage mother who struggled to find stable housing, LeBron moved from apartment to apartment in Akron, Ohio, as a young boy. He used basketball and strict team brotherhood as his anchor, outworking every peer to become the ultimate role model.",
    questions: [
      "Are you pacing yourself effectively to maintain high-quality input over the long run?",
      "What details did you double-check to hold yourself truly accountable?",
      "How can you uplift or support your team members and colleagues next?"
    ]
  },
  {
    id: 'serena_williams',
    name: 'Serena Williams',
    title: 'Tennis Icon & 23-Time Grand Slam Champion',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/e/e4/Serena_Williams_at_the_2013_US_Open_04.jpg&w=200&h=200&fit=cover',
    jerseyNumber: 'World No. 1',
    bio: 'Widely considered the greatest female tennis competitor of all time, acclaimed for her ferocious power, unbreakable willpower, and champion instinct.',
    quotes: [
      "I've had to learn to fight all my life - got to learn to keep smiling. If you smile things will work out.",
      "The champion is defined not by their wins but by how they can recover when they fall down.",
      "I am lucky that whatever fear I have inside me, my desire to win is always stronger.",
      "You have to believe in yourself when no one else does."
    ],
    achievements: [
      "Won 23 Grand Slam singles titles, the most by any player in the Open Era of tennis.",
      "Earned an outstanding Career Golden Slam in both singles and doubles, winning all four Grand Slams and Olympic Gold.",
      "Held the WTA world number one singles ranking for 319 weeks, including a joint-record 186 consecutive weeks."
    ],
    inspiration: "Serena trained as a young girl on cracked, public concrete courts in Compton, California, dodging danger. Her father used worn tennis balls to teach her and her sister Venus. She overcame multiple life-threatening injuries and health scares later in life, returning each time with fierce resolve to lift championship trophies.",
    questions: [
      "Did you rise up to face adversity with real competitive grit during this task?",
      "Are you allowing any voices of doubt to deter you, or are you pushing them aside?",
      "What is the single most powerful strength you utilized to get this done today?"
    ]
  },
  {
    id: 'mahatma_gandhi',
    name: 'Mahatma Gandhi',
    title: 'Pioneer of Satyagraha & Freedom Leader',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/7/7a/Mahatma-Gandhi%2C_portrait._Studio_Goss_closeup_crop.jpg&w=200&h=200&fit=cover',
    bio: 'Led India to freedom and inspired civil rights movements worldwide through peaceful non-violent resistance.',
    quotes: [
      "The future depends on what you do today.",
      "Strength does not come from physical capacity. It comes from an indomitable willful intent.",
      "Be the change that you wish to see in the world.",
      "In a gentle way, you can shake the world."
    ],
    achievements: [
      "Fought racial discrimination in South Africa and formulated the strategic philosophy of non-violent resistance (Satyagraha).",
      "Successfully led the peaceful Salt March and absolute mass movements resulting in Indian independence from colonial rule.",
      "Inspired prominent civil rights leaders globally, including Martin Luther King Jr. and Nelson Mandela."
    ],
    inspiration: "Gandhi began his career as a highly shy, soft-spoken lawyer who literally froze during his first courtroom appearance and had to run out. By slowly practicing simple daily habits and quiet self-discipline, he developed an unmatched, indomitable will.",
    questions: [
      "Does this completed task align with your larger purpose and core values?",
      "How can you practice more patience and steady consistency going forward?",
      "Are you backing up your grand intentions with humble, daily efforts?"
    ]
  },
  {
    id: 'marie_curie',
    name: 'Marie Curie',
    title: 'First Two-Science Nobel Laureate',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/c/c8/Marie_Curie_c._1920s.jpg&w=200&h=200&fit=cover',
    bio: 'Pioneered early research on radioactivity, conquering immense institutional resistance and health obstacles.',
    quotes: [
      "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
      "We must have perseverance and above all confidence in ourselves.",
      "Be less curious about people and more curious about ideas.",
      "I was taught that the way of progress was neither swift nor easy."
    ],
    achievements: [
      "First person to win two Nobel Prizes, and the only individual in history to win them in different sciences (Physics and Chemistry).",
      "Discovered radium and polonium, coined the term radioactivity, and pioneered techniques to isolate radioactive isotopes.",
      "Developed and personally deployed mobile radiography cars ('Little Curies') during WWI, saving over a million soldiers."
    ],
    inspiration: "Working in a drafty, unventilated wooden shed with no funding or support, she spend years hand-stirring tons of pitchblende to extract tiny fractions of radium. Her single-focused devotion to truth is the pinnacle of human dedication.",
    questions: [
      "Have you brought real analytical rigor and critical thinking to this milestone?",
      "Are you willing to stick with difficult concepts until they are fully understood?",
      "What new insight or lessons did you extract from this session?"
    ]
  },
  {
    id: 'albert_einstein',
    name: 'Albert Einstein',
    title: 'Theoretical Physicist & Visionary',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/3/3e/Einstein_1921_by_F_Schmutzer_-_crop.jpg&w=200&h=200&fit=cover',
    bio: 'Changed our fundamental understanding of time, space, matter, and the origin of the cosmos.',
    quotes: [
      "Information is not knowledge. The only source of knowledge is experience.",
      "I have no special talent. I am only passionately curious.",
      "A person who never made a mistake never tried anything new.",
      "In the middle of difficulty lies opportunity."
    ],
    achievements: [
      "Formulated the Special and General Theories of Relativity, transforming classical physics.",
      "Discovered the photoelectric effect, a cornerstone of quantum theory, for which he received the 1921 Nobel Prize.",
      "Constructed the mathematical proof for the existence of atoms and modeled the thermodynamic behavior of light."
    ],
    inspiration: "Rejected for academic teaching roles, Einstein worked as a humble patent clerk in Switzerland. In his spare time, completely isolated from active laboratories, his creative thought experiments birthed four paper masterpieces in his 'Annus Mirabilis' of 1905.",
    questions: [
      "Did you allow your imagination and creative perspective to solve blockages today?",
      "How can you simplify a highly complicated element in your remaining work?",
      "What core truth or hidden simplicity did you uncover in this task?"
    ]
  },
  {
    id: 'maya_angelou',
    name: 'Maya Angelou',
    title: 'Acclaimed Poet, Writer & Activist',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/4/4f/Maya_Angelou_at_Clinton_Inaugural_cropped.jpg&w=200&h=200&fit=cover',
    bio: 'Breathed courage into civil rights narratives and poetry, celebrating self-respect, grace, and inner resilience.',
    quotes: [
      "You may encounter many defeats, but you must not be defeated.",
      "If you don't like something, change it. If you can't change it, change your attitude.",
      "Nothing can dim the light which shines from within.",
      "We delight in the beauty of the butterfly, but rarely admit the changes it has gone through to achieve that beauty."
    ],
    achievements: [
      "Authored 'I Know Why the Caged Bird Sings', a landmark autobiographical work of unmatched literary focus and emotional depth.",
      "Awarded the Presidential Medal of Freedom and nominated for a Pulitzer Prize.",
      "Spent decades as a prominent, key civil rights activist speaking alongside Martin Luther King Jr. and Malcolm X."
    ],
    inspiration: "Angelou endured severe childhood trauma and racism, choosing a voluntary state of absolute silence for five full years. During that quiet phase, she cultivated a remarkable inner library of imagery, memory, and word craft.",
    questions: [
      "Did you practice self-compassion and integrity during this work session?",
      "How is your authentic voice and values reflected in the quality of your output?",
      "How did you overcome self-doubt to complete this progress marker?"
    ]
  },
  {
    id: 'ada_lovelace',
    name: 'Ada Lovelace',
    title: 'First Computer Programmer',
    avatar: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/0/0f/Ada_lovelace.jpg&w=200&h=200&fit=cover',
    bio: 'A visionary mathematician who blended numbers with creative imagination to foresee the digital age.',
    quotes: [
      "The analytical engine weaves algebraic patterns just as the Jacquard loom weaves flowers.",
      "Your best thoughts are often those that form silently and gradually.",
      "My brain is something more than merely mortal; as time will show.",
      "Understand the beauty of science, and let its truth guide your soul."
    ],
    achievements: [
      "Wrote the world's very first computer algorithm, designed to compute Bernoulli numbers on Charles Babbage's Analytical Engine.",
      "Pioneered the critical concept of 'Poetical Science', uniting analytical mathematics with artistic imagination.",
      "Accurately predicted that computers would go beyond simple calculations to synthesize music, graphics, and scientific models."
    ],
    inspiration: "Living in a nineteenth-century society that severely restricted intellectual education for women, Lovelace collaborated tirelessly with inventors and worked until dawn decoding intricate mathematical tables despite falling severely ill.",
    questions: [
      "How are you combining logical structure with creative imagination in your goals?",
      "Can you design active workflows or routines that run more systematically?",
      "Is your mind fully focused, or did you make space for gradual, silent insights?"
    ]
  }
];

export const getSelectedMentor = (): InspirationMentor => {
  const chosenId = localStorage.getItem('horizon_selected_mentor');
  const mentor = INSPIRATION_MENTORS.find(m => m.id === chosenId);
  return mentor || INSPIRATION_MENTORS[0]; // fallback
};

export const setSelectedMentorId = (id: string) => {
  localStorage.setItem('horizon_selected_mentor', id);
  // Dispatch custom event to let other views know a mentor has changed
  window.dispatchEvent(new CustomEvent('horizon_mentor_changed', { detail: id }));
};
