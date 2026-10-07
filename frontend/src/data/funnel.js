export const TESTIMONIALS = [
  {
    quote: 'Some properties later... I actually regret not having found this sooner. Very happy so far. Thanks!',
    name: 'Brian Welch',
    role: 'Morgan Stanley',
    location: 'USA',
  },
  {
    quote: 'Made this 12% of our private retirement fund. My wife and I just want to thank the team for the difference this has made.',
    name: 'Allen Goldstein & Mary Goldstein',
    location: 'United Kingdom',
  },
  {
    quote: "It's hard to find stable investments with an easy exit so I'm just grateful to these youngsters for making this possible.",
    name: 'Tara Gold',
    role: 'Atlantic Wealth',
    location: 'USA',
  },
  {
    quote: 'We invested $355,000 in July and our servers are yielding $14,750 per month already. Super random investment but glad we did it.',
    name: 'Sarah Siadat',
    role: 'Film Producer',
    location: 'UAE',
  },
  {
    quote: 'I manage portfolio for few private investors and must say, this has pumped my image much in town, so thank you very much.',
    name: 'Jaime Casellas',
    role: 'Caribbean Private Equity Partners',
    location: 'Puerto Rico',
  },
  {
    quote: 'Young actress career, money comes in batches and stability needs to come from investments like these. Did not understand at first but this is way easier. Never forget where you came from!',
    name: 'Natalia Rosa',
    role: 'Actress',
    location: 'Brazil',
  },
];

export const FAQ = [
  {
    q: 'How long does it take to get my servers?',
    type: 'timeline',
    items: [
      ['Buy servers + 2 years of rack space', '5 minutes'],
      ['Get your dashboard', 'Immediately'],
      ['We have the physical servers shipped to your selected data center', '24–72 hours'],
      ['We virtually configure the servers once in the data center and download its software', '24 hours'],
      ['We link the physical servers to the CoCo cloud', '24 hours'],
      ['Your dashboard activates and measures usage of the physical servers', '24 hours'],
    ],
  },
  {
    q: 'How do my servers earn cash?',
    type: 'steps',
    items: [
      "Your servers' capacity is made available on the CoCo cloud.",
      'When developers use the cloud, load gets distributed to your servers.',
      'Usage is metered through the cloud meter billing program.',
      'CoCo collects this cash from the user plus our 20% fee.',
      'Your earnings continue accumulating as usage increases.',
      'The balance is dispatched to your bank account on the 28th of each month.',
    ],
  },
  {
    q: 'How do I exit or sell them?',
    type: 'list',
    items: [
      'When you buy the servers, they are registered in your name and assigned to a data center of your choice.',
      'You can deal with the data center directly any time and can visit, disconnect or collect the servers any time.',
      'There is no cancellation fee. You simply disconnect the servers by clicking the "Disconnect" button on your dashboard.',
      'You will still be paid out for any earnings outstanding for that month.',
      'Servers sell quickly and easily through eBay and Craigslist, but can also be refurbished through specialized dealers.',
      "You will be able to sell the servers back to us or into the CoCo owners network, but you may lose 30% or more of the servers' value depending on the age of the server and market dynamics.",
      'We also have a buy-back option where, if you make less than a 10% ROI from CoCo cloud in year one, we will buy the server back from you at cost price.',
    ],
  },
  {
    q: 'How long does it take to start earning?',
    type: 'list',
    items: [
      'It can take anywhere from 1–3 months to start seeing a return on the server, while it may only reach full capacity after 12–24 months.',
      'It depends a lot on market demand, but we will always sell at 2–3 times total server capacity since we can redistribute load across the cloud to maximize earnings for owners.',
    ],
  },
  {
    q: 'How accurate is the metering system?',
    type: 'list',
    items: [
      'Due to the high volume of owners and cloud users in our network, the system relies on a standardized price calculation and cannot make any exceptions, since metering and money are directly tied together.',
      'CoCo collects prepayments from end users and only allows them to use resources within their budget allocation.',
      'The system allocates resources proportionally to usage to cloud partners.',
      "Your data center can report to you privately on your server's energy consumption to verify.",
      'You may also rent the server out as a bare metal option, meaning you have a single tenant renting on a 12-month contract.',
    ],
  },
  {
    q: 'Costs and returns?',
    type: 'returns',
    items: [
      'Smaller servers start at about $18,000 per server including setup, coding, cloud linking and 2 years of data center tenancy. These rent out for about $0.012 per vCPU hour with about 60 vCPU of capacity, meaning $0.72 per hour earned and $518 per month.',
      'Larger servers sell for about $150,000 and rent out at the same rate per vCPU hour. Their capacity is often around 1,200 vCPU and they can earn upwards of $10,360 per month.',
    ],
    figures: [
      ['10 small servers', '$5,180', 'per month on average'],
      ['10 large servers', '$103,600', 'per month on average'],
    ],
    note: 'These are gross estimates before the 20% CoCo fee, and represent yields of a server that has reached network maturity after 10–12 months in the network.',
  },
  {
    q: 'Depreciation?',
    type: 'list',
    items: ['Yes. Servers depreciate within 7 years, give or take.'],
  },
];
