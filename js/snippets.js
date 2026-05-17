/* js/snippets.js — Steven's clipboard message templates
   Depends on: data.js (state, saveState)
   Must load BEFORE clipboard.js */

/* =========================================================
   DEFAULT_SNIPPETS — grouped clipboard messages
   Each group: { id, label, emoji, items: [{id, text}] }
   state.snippets = null  → use DEFAULT_SNIPPETS
   state.snippets = [...] → custom (same shape, persisted)
   ========================================================= */
const DEFAULT_SNIPPETS = [
  {
    id: 'intro',
    label: 'Intro',
    emoji: '👋',
    items: [
      {
        id: 'intro-1',
        text: 'Hi, my name is Steven, I am from Austria and now I live in Kuningan. Are you near me?'
      },
      {
        id: 'intro-2',
        text: "Whats your schedule like? Wanna meet sometime when we both finish work?"
      },
      {
        id: 'intro-3',
        text: "Sorry, i'm not using this app much. Lets write on Whatsapp: +43 677 6236 3922\nBut, please only write me if you a truly and honestly interested in me. I don't like girls who write and then just ghost just wasting my time."
      },
      {
        id: 'intro-4',
        text: "I'm staying near Kota Kasablanka. Where do u live and work?"
      },
      {
        id: 'intro-5',
        text: "I work in real estate. I manage apartments for my family remotely. That's why I can live in Jakarta half the time, and also spend time in Europe in summer months. Whats your job like?"
      }
    ]
  },
  {
    id: 'vibes',
    label: 'Vibes',
    emoji: '😘',
    items: [
      {
        id: 'vibes-1',
        text: "Can you share some cute pics of you?\nPreferably without filter hehe. ;)"
      },
      {
        id: 'vibes-2',
        text: "U look cute.. I would totally give u hugs and 😘 kisses if we meet. 🤗"
      },
      {
        id: 'vibes-3',
        text: "That's totally okay.. I think if 2 people like each other then their vibe will be good.. thats most important - for any details we can always use translate app."
      },
      {
        id: 'vibes-4',
        text: "Of course lol... Many people don't speak English.. that has never stopped me from making good connection or having romance.. it's just a matter of your open mindedness.\nWe all have to beware of our limiting beliefs... It's our own negativity and anxieties that prevent us from happiness and success in life my dear 🥲😂"
      }
    ]
  },
  {
    id: 'logistics',
    label: 'Logistics',
    emoji: '📅',
    items: [
      {
        id: 'logistics-1',
        text: "Say do u live in a kos that has a curfew. Or u can also meet late or go home late?"
      },
      {
        id: 'logistics-2',
        text: "That's why I want to know your rough schedule.. if u live at home or have your own kos.. so we can plan ahead"
      },
      {
        id: 'logistics-3',
        text: "Do u work a very regular 9-5 mon to Friday?.. I know some people in digital marketing have silly unpaid overtime"
      },
      {
        id: 'logistics-4',
        text: "First time we just eat something... Then we can jalan a bit. If u feel comfortable we can hangout at my apartment and cuddle a bit. You decide for yourself when you feel ready to become a real woman. I don't give you any pressure okay?"
      },
      {
        id: 'logistics-5',
        text: "It just doesn't make sense to delay a date with me if u like me. Especially if you are just staying home and watching k-dramas all day 🤷 don't u think?"
      },
      {
        id: 'logistics-6',
        text: "Ah see someone came to their senses. 😅 So it's better to meet a nice guy in real life, than spend all day to fantasize about some unrealistic Korean actor at home right? Haha 😉"
      }
    ]
  },
  {
    id: 'connection',
    label: 'Connection',
    emoji: '💬',
    items: [
      {
        id: 'connection-1',
        text: "Have u ever dated foreigners?\nAnd have u ever been intimate with anyone before?"
      },
      {
        id: 'connection-2',
        text: "I m sorry.. I care about ur feeling of course.\nI m asking just to be sure you actually like me... Because many girls from tinder just want to get free dinner and not even interested in the man."
      },
      {
        id: 'connection-3',
        text: "There's also girls who just want to have sex once or twice and then ghost me.. I prefer having a longer and more genuine connection. It's more fun when u get to meet the person more deeply and u feel also relaxed and appreciated."
      },
      {
        id: 'connection-4',
        text: "Im interested in a genuine connection. So when I feel good with someone, also Sex is a part of that but not the main part."
      },
      {
        id: 'connection-5',
        text: "Some People don't understand - maybe sex is a big deal in some cultures or for some people... They think it's an end.. but actually it's just the beginning of a new connection."
      },
      {
        id: 'connection-6',
        text: "If ur just looking for a friend that's totally fine. We can also be friends and meet at expat event. No need to waste time for dating frame then."
      },
      {
        id: 'connection-7',
        text: "If u just wanna be friends - totally okay also - better u just say it from the start.. then I won't even try to be romantic or anything.. just treat u like a buddy. But it's up to you to communicate clearly."
      }
    ]
  },
  {
    id: 'intimate',
    label: 'Intimate',
    emoji: '🌶️',
    items: [
      {
        id: 'intimate-1',
        text: "So are you okay if we try kiss and touching and maybe more if you are comfortable?"
      },
      {
        id: 'intimate-2',
        text: "Ofc I like enjoy more... But only if u are comfortable with me.. it's important for me that u always feel safe."
      },
      {
        id: 'intimate-3',
        text: "I will do my best to make you comfortable.. sorry if I am so direct haha.. but I like to be honest.. many girls want to take advantage of guys and their time and money and I m just protecting myself. 🥲😅"
      },
      {
        id: 'intimate-4',
        text: "So ... do u want to kiss me all over my body too? 😘"
      },
      {
        id: 'intimate-5',
        text: "We are planning to do adult things.. so we have to act in a responsible way. Tracking your period helps prevent unwanted pregnancy. Also I will know when you are in a bad mood. U never track your cycle?"
      },
      {
        id: 'intimate-6',
        text: "Say, have you ever had a 3some or 4some? My friend Toumi wants to try sex : 2 girls and 2 boys together. 😅✨😎"
      },
      {
        id: 'intimate-7',
        text: "But I hope u don't have period ya? Otherwise my bedsheet will get bloody. 😅"
      }
    ]
  },
  {
    id: 'pushback',
    label: 'Pushback',
    emoji: '💰',
    items: [
      {
        id: 'pushback-0a',
        text: "But of course if u don't find me interesting, then you can come up with all the excuses you want to not meet me. 🤷🙄 And it's not my job to convince you."
      },
      {
        id: 'pushback-0b',
        text: "No why should I be? It's your loss if u don't meet me. 🤷 I simply save time.\nI m just trying to understand your way of thinking."
      },
      {
        id: 'pushback-1',
        text: "We chat so long.. and NOW u tell me you are an escort!??"
      },
      {
        id: 'pushback-2',
        text: "Just imagine if I said: my time is valuable - if u want to meet me you have to pay by the HOUR! how would that make YOU feel?"
      },
      {
        id: 'pushback-3',
        text: "So u are telling ALL the other girls I have met, are stupid? And only u are smart or what? Normal people don't ask me for money.\nI already provide u free transport, free place to sleep, free food and entertainment... U want to be PAID for having a good time!??? Are u not ASHAMED at all??"
      },
      {
        id: 'pushback-4',
        text: "Look, what u are looking for is something like a sugar daddy and sugar baby relationship... That's totally okay.. many girls do that... But why can't u just say it at the beginning? Why trick me?"
      },
      {
        id: 'pushback-5',
        text: "And yes, it's awkward because I have never ever had a girl ask me for money directly the way you did. And I would never pay for sex.\nIf I only wanted sex, then I could just go to a massage place. It would be very cheap for 350k and I would not have to text for hours or try to get to know anyone."
      },
      {
        id: 'pushback-6',
        text: "But at the same time, u feel you are being taken advantage of... for some strange reason although u are not a sex worker.. (I can only hope)\nSo how do we resolve this issue?"
      }
    ]
  }
];
