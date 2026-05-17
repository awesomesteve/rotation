/* js/content.js — text content: toasts, openers, philosophical quotes + wiring */
/* Load order: after data.js + skyline.js, BEFORE profiles.js.
   TOASTS / TINDER_OPENERS / PHILOSOPHICAL_QUOTES must exist before profiles.js runs.
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
  { t: "A man who chases two rabbits catches neither.", a: "Confucius" }
];

(function wireFortunesAndOpeners() {
  function fortune() {
    if (typeof showToast === 'function' && TOASTS.length)
      showToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
  }
  function opener() {
    if (typeof showToast === 'function' && TINDER_OPENERS.length)
      showToast(TINDER_OPENERS[Math.floor(Math.random() * TINDER_OPENERS.length)]);
  }
  // Wrap showView lazily — defer to after all scripts have loaded (profiles.js defines it)
  setTimeout(() => {
    if (typeof showView === 'function') {
      const orig = showView;
      window.showView = function(name) {
        orig(name);
        if (Math.random() < 0.12) setTimeout(fortune, 400);
        if (Math.random() < 0.30) setTimeout(opener, 500);
      };
    }
  }, 0);
  setTimeout(opener, 8000 + Math.random() * 7000);
  setInterval(() => { if (Math.random() < 0.55) opener(); }, 45000 + Math.random() * 45000);
})();
