/* js/quotes.js — all quote/text content: TOASTS, TINDER_OPENERS, PHILOSOPHICAL_QUOTES, TATE_QUOTES + wiring */
/* Load order: after data.js + skyline.js, BEFORE snippets.js / profiles.js.
   TOASTS / TINDER_OPENERS / PHILOSOPHICAL_QUOTES / TATE_QUOTES must exist before profiles.js runs.
   showView / showToast are defined in profiles.js (loaded after), so we wrap lazily. */

const TOASTS = [
  "You're on fire today 🔥","Statistically, you're winning",
  "She's definitely thinking about you","Jakarta's a small town, be kind",
  "Plot twist incoming","Time to message someone you forgot about",
  "New week, new vibes","Hydrate. Then text.","Your stamina is impressive",
  "Cream of the crop ✨","Audit your roster, king","Tuesday is the new Friday",
  "Don't forget to actually have fun","Triple-text energy 📲",
  "The bold get the brunch","Reply faster, live louder",
  "Wear the nicer cologne tonight","Eye contact is a love language",
  "Don't @ her at 3am 🌙","Confidence is a haircut away",
  "Order the cocktail, not the beer","Your future self says thanks",
  "Date with intention, not desperation","The right ones make it easy",
  "Walk her to the Grab 🚖","Tip generously, always",
  "Charm > looks. Always.","Smile first. Talk second.",
  "A great date is half listening","Compliment the laugh, not the looks",
  "Show up. The rest is noise.","Be the man you'd swipe right on",
  "Quality > quantity, always","Boredom is a choice",
  "Manifest, then message","She likes guys who read books",
  "Cancel the date you're dreading","Sunday brunch wins again 🥂",
  "Buy the flowers. Just once.","Today's mood: main character",
  "Touch grass between texts 🌱","Iced coffee fixes 80% of things",
  "Take the stairs, take the chance","Sleep is also self-care",
  "Be early. It impresses everyone.","Don't explain. Just do.",
  "Less swiping, more meeting","The roster respects discipline",
  "You're not late. They're early.","Romance the city itself 🌃",
  "Eat the spicy noodles 🌶️","Forgive yourself for last night",
  "Some risks are just stories","Be kind to baristas",
  "Take her somewhere with stars","Walk slowly when it rains",
  "Memorize her coffee order","Compliments cost nothing"
];

const TINDER_OPENERS = [
  '"Roses are red, violets are fine, you be the 6, I\'ll be the 9"',
  '"Are you Indonesian? Because you\'re Indo-mie nice"',
  '"Do you have a map? I keep getting lost in your eyes"',
  '"Is your name Wi-Fi? Because I\'m feeling a connection"',
  '"Hi, I\'m writing a phone book. Can I get your number?"',
  '"Are you a parking ticket? You\'ve got fine written all over you"',
  '"Do you believe in love at first swipe?"',
  '"Was your dad a boxer? Because you\'re a knockout"',
  '"If I were a cat I\'d spend all 9 lives with you"',
  '"On a scale of 1 to America, how free are you tonight?"',
  '"Was your dad a baker? Because you\'ve got nice buns"',
  '"Quick — what\'s your favorite kind of nasi goreng?"',
  '"Two truths and a lie. Go."',
  '"Sudirman or Kemang for the first date?"',
  '"I bet your bio is more interesting than mine"',
  '"You look like trouble. I like trouble."',
  '"Be honest — what\'s your red flag?"',
  '"Are you a magician? Because everyone else disappears when I see you"',
  '"Pineapple on pizza — yes or war crime?"',
  '"You\'re the Monas to my Jakarta"',
  '"Quick question: who hurt you?"',
  '"If we got married, would you take my last name or hyphenate?"',
  '"What\'s your most controversial food opinion?"',
  '"You\'re cute. That\'s a problem."',
  '"Do you do this often? (date guys with my exact vibe)"',
  '"Coffee, drinks, or instant chaos?"',
  '"What\'s your toxic trait?"',
  '"Hello. This is the part where you say hi back."',
  '"You\'re the first match I\'ve actually messaged this week. Make it count."',
  '"Tell me your zodiac so I can pretend to care"'
];

const PHILOSOPHICAL_QUOTES = [
  { t: "The unexamined life is not worth living.", a: "Socrates" },
  { t: "We suffer more in imagination than in reality.", a: "Seneca" },
  { t: "Waste no more time arguing what a good man should be. Be one.", a: "Marcus Aurelius" },
  { t: "It is not death that a man should fear, but he should fear never beginning to live.", a: "Marcus Aurelius" },
  { t: "No man ever steps in the same river twice.", a: "Heraclitus" },
  { t: "Happiness depends upon ourselves.", a: "Aristotle" },
  { t: "I know that I know nothing.", a: "Socrates" },
  { t: "The best revenge is not to be like your enemy.", a: "Marcus Aurelius" },
  { t: "Luck is what happens when preparation meets opportunity.", a: "Seneca" },
  { t: "Difficulties strengthen the mind, as labour does the body.", a: "Seneca" },
  { t: "When you realize there is nothing lacking, the whole world belongs to you.", a: "Lao Tzu" },
  { t: "A journey of a thousand miles begins with a single step.", a: "Lao Tzu" },
  { t: "Knowing yourself is the beginning of all wisdom.", a: "Aristotle" },
  { t: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
  { t: "The mind is everything. What you think you become.", a: "Buddha" },
  { t: "You only lose what you cling to.", a: "Buddha" },
  { t: "Be yourself; everyone else is already taken.", a: "Oscar Wilde" },
  { t: "We are all in the gutter, but some of us are looking at the stars.", a: "Oscar Wilde" },
  { t: "Not all those who wander are lost.", a: "J.R.R. Tolkien" },
  { t: "Tell me, what is it you plan to do with your one wild and precious life?", a: "Mary Oliver" },
  { t: "The privilege of a lifetime is to become who you truly are.", a: "Carl Jung" },
  { t: "To love at all is to be vulnerable.", a: "C.S. Lewis" },
  { t: "The heart has its reasons of which reason knows nothing.", a: "Blaise Pascal" },
  { t: "Lovers don't finally meet somewhere. They're in each other all along.", a: "Rumi" },
  { t: "The wound is the place where the light enters you.", a: "Rumi" },
  { t: "Do not regret what you have done.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "Accept everything just the way it is.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "Today is victory over yourself of yesterday.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "In all things have no preferences.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "Do nothing which is of no use.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "The way is in training.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "Think lightly of yourself and deeply of the world.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "You can only fight the way you practice.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "Truth is not what you want it to be; it is what it is.", a: "🇯🇵 Miyamoto Musashi ⛩️" },
  { t: "Always pass on what you have learned.", a: "Yoda" },
  { t: "The opposite of love is not hate, it's indifference.", a: "Elie Wiesel" },
  { t: "A man who chases two rabbits catches neither.", a: "Confucius" },

  // Sun Tzu — Art of War
  { t: "Supreme excellence consists in breaking the enemy's resistance without fighting.", a: "☯️ Sun Tzu — Art of War" },
  { t: "Appear weak when you are strong, and strong when you are weak.", a: "☯️ Sun Tzu — Art of War" },
  { t: "He who knows when he can fight and when he cannot will be victorious.", a: "☯️ Sun Tzu — Art of War" },
  { t: "The greatest victory is that which requires no battle.", a: "☯️ Sun Tzu — Art of War" },
  { t: "Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.", a: "☯️ Sun Tzu — Art of War" },
  { t: "Move swift as the wind, and closely formed as the wood. Attack like the fire, and be still as the mountain.", a: "☯️ Sun Tzu — Art of War" },
  { t: "Know thy self, know thy enemy. A thousand battles, a thousand victories.", a: "☯️ Sun Tzu — Art of War" },
  { t: "The wise warrior avoids the battle.", a: "☯️ Sun Tzu — Art of War" },

  // Seneca — more
  { t: "Begin at once to live, and count each separate day as a separate life.", a: "Seneca" },
  { t: "It is not that I'm so brave, it's just that I'm busy.", a: "Seneca" },
  { t: "Omnia aliena sunt, tempus tantum nostrum est. — All things are alien; time alone is ours.", a: "Seneca" },
  { t: "If you wish to be loved, love.", a: "Seneca" },
  { t: "The part of life we really live is small. All the rest is not life, but merely time.", a: "Seneca" },
  { t: "He who is brave is free.", a: "Seneca" },
  { t: "Life is long if you know how to use it.", a: "Seneca" },
  { t: "Retire into yourself as much as possible. Associate with those who are likely to make you better.", a: "Seneca" },

  // Epictetus
  { t: "Make the best use of what is in your power, and take the rest as it happens.", a: "Epictetus" },
  { t: "Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.", a: "Epictetus" },
  { t: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.", a: "Epictetus" },
  { t: "First say to yourself what you would be; and then do what you have to do.", a: "Epictetus" },
  { t: "We cannot choose our external circumstances, but we can always choose how we respond to them.", a: "Epictetus" },
  { t: "No man is free who is not master of himself.", a: "Epictetus" },

  // Nietzsche
  { t: "He who has a why to live can bear almost any how.", a: "Nietzsche" },
  { t: "That which does not kill us makes us stronger.", a: "Nietzsche" },
  { t: "Without music, life would be a mistake.", a: "Nietzsche" },
  { t: "The higher we soar, the smaller we appear to those who cannot fly.", a: "Nietzsche" },
  { t: "One must still have chaos in oneself to be able to give birth to a dancing star.", a: "Nietzsche" },
  { t: "It is not a lack of love, but a lack of friendship that makes unhappy marriages.", a: "Nietzsche" },

  // Viktor Frankl
  { t: "When we are no longer able to change a situation, we are challenged to change ourselves.", a: "Viktor Frankl" },
  { t: "Between stimulus and response there is a space. In that space is our power to choose our response.", a: "Viktor Frankl" },
  { t: "Those who have a 'why' to live, can bear with almost any 'how'.", a: "Viktor Frankl" },
  { t: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.", a: "Viktor Frankl" },

  // Naval Ravikant
  { t: "Seek wealth, not money or status. Wealth is having assets that earn while you sleep.", a: "Naval Ravikant" },
  { t: "The most important skill for getting rich is becoming a perpetual learner.", a: "Naval Ravikant" },
  { t: "Desire is a contract you make with yourself to be unhappy until you get what you want.", a: "Naval Ravikant" },
  { t: "A fit body, a calm mind, a house full of love. These things cannot be bought — they must be earned.", a: "Naval Ravikant" },
  { t: "Play long-term games with long-term people.", a: "Naval Ravikant" },
  { t: "Reading is the original download.", a: "Naval Ravikant" },

  // Marcus Aurelius — more
  { t: "You have power over your mind, not outside events. Realize this, and you will find strength.", a: "Marcus Aurelius" },
  { t: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", a: "Marcus Aurelius" },
  { t: "The impediment to action advances action. What stands in the way becomes the way.", a: "Marcus Aurelius" },
  { t: "Never esteem anything as of advantage to you that will make you break your word or lose your self-respect.", a: "Marcus Aurelius" },
  { t: "If it is not right, do not do it; if it is not true, do not say it.", a: "Marcus Aurelius" },

  // Dostoevsky
  { t: "Beauty will save the world.", a: "Dostoevsky" },
  { t: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", a: "Dostoevsky" },
  { t: "To love someone means to see them as God intended them.", a: "Dostoevsky" },

  // Albert Camus
  { t: "You will never be happy if you continue to search for what happiness consists of.", a: "Albert Camus" },
  { t: "In the midst of winter, I found there was, within me, an invincible summer.", a: "Albert Camus" },
  { t: "Don't walk behind me; I may not lead. Don't walk in front of me; I may not follow. Just walk beside me and be my friend.", a: "Albert Camus" },

  // Ernest Hemingway
  { t: "The world breaks everyone, and afterward, some are strong at the broken places.", a: "Ernest Hemingway" },
  { t: "There is no friend as loyal as a book.", a: "Ernest Hemingway" },
  { t: "Courage is grace under pressure.", a: "Ernest Hemingway" },

  // Carl Jung
  { t: "You are what you do, not what you say you'll do.", a: "Carl Jung" },
  { t: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", a: "Carl Jung" },
  { t: "Who looks outside, dreams; who looks inside, awakes.", a: "Carl Jung" }
];


const TATE_QUOTES = [
    "If you’re not in control of your own time, you’re not in control of your life.",
    "You must put in the effort. There are no shortcuts to the top.",
    "The man who goes to the gym every single day has already won half the battle.",
    "Arrogance is a mask worn by men who are afraid to show their true strength.",
    "Do the impossible and you’ll never doubt yourself or your abilities again.",
    "Decide what you want and pursue it relentlessly, without apology.",
    "Your mind must be stronger than your feelings.",
    "Be a man of substance. A man of value. Women respect power — earn it.",
    "Pain is temporary. The pride of discipline lasts a lifetime.",
    "Stop explaining yourself to people who don’t deserve access to your energy.",
    "You have to be willing to outwork everyone around you.",
    "Never chase. Build something worth chasing you.",
    "The world will always try to destroy a man who refuses to be ordinary.",
    "Confidence is not loud. It is calm, focused, and relentless.",
    "A man without a plan is a passenger in someone else’s life.",
    "The secret is simple — do what most men won’t.",
    "Your standards reveal your self-worth. Raise them or stay average.",
    "Every moment of weakness is a moment stolen from your future self.",
    "Real value is demonstrated, never begged for.",
    "Winners don’t explain themselves to losers."
  ,
    "You are the only person who can make this work, and you are the only person who can mess this up.",
    "Find a person who is as successful as you’d like to be, ask them what to do, do it and work hard.",
    "Moody females steal your power. It is dangerous for a man. A man must remain focused.",
    "If you have a mind that you can’t control, you’re never going to be a king.",
    "It is your duty to make your bloodline mean something.",
    "We will either live the life of our dreams or die trying.",
    "Action is the only way you’ll progress. Not talking. Not planning. Not reading books.",
    "You will live a life few think is possible. Do you have what it takes?",
    "Close your eyes. Feel excited, powerful. Imagine yourself destroying goals with ease.",
    "The only way to make money is to do stuff.",
    "I was never afraid to lose all my money or die in combat.",
    "Are you better on your worst day than your opponent on their best?",
    "My unmatched perspicacity coupled with sheer indefatigability makes me a feared opponent in any realm of human endeavour.",
    "Loser rolls with losers. Winner rolls with winners.",
    "I think I’m the man. I find that a source of motivation."
  ];

(function wireFortunesAndOpeners() {
  function fortune() {
    if (typeof showToast === 'function' && TOASTS.length)
      showToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
  }
  function opener() {
    const t = document.getElementById('easterToast');
    if (!t || !TINDER_OPENERS.length) return;
    const text = TINDER_OPENERS[Math.floor(Math.random() * TINDER_OPENERS.length)];
    t.textContent = text;
    t.style.background = 'linear-gradient(135deg, #ff6eb0 0%, #ff3d8a 100%)';
    t.style.boxShadow = '0 8px 24px rgba(255,61,138,.45)';
    t.style.cursor = '';
    t.classList.add('show');
    const ms = Math.min(7000, Math.max(3200, text.length * 50));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => { t.style.background = ''; t.style.boxShadow = ''; }, 500);
    }, ms);
  }
  // Wrap showView lazily — defer to after all scripts have loaded (profiles.js defines it)
  setTimeout(() => {
    if (typeof showView === 'function') {
      const orig = showView;
      window.showView = function(name, _fromPop) {
        orig(name, _fromPop);
        if (Math.random() < 0.12) setTimeout(fortune, 400);
        if (Math.random() < 0.30) setTimeout(opener, 500);
      };
    }
  }, 0);
  setTimeout(opener, 8000 + Math.random() * 7000);
  setInterval(() => { if (Math.random() < 0.55) opener(); }, 45000 + Math.random() * 45000);
})();
