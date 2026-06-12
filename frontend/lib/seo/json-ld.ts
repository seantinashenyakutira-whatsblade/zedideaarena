const BASE_URL = 'https://zedideaarena.com'

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'ZedIdeaArena',
    alternateName: 'ZedIdeaArena — Win by Sharing Your Ideas',
    url: BASE_URL,
    logo: `${BASE_URL}/logo-icon.png`,
    description:
      'A fintech-style idea competition and crowdfunding platform. Pitch your ideas, compete with others, and win funding.',
    foundingDate: '2024-01-01',
    founder: [{ '@type': 'Person', name: 'Sean Tinashe Nyakutira' }],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@zedideaarena.com',
      contactType: 'customer support',
    },
    sameAs: [
      'https://tiktok.com/@zedideaarena',
      'https://instagram.com/zedideaarena',
      'https://twitter.com/zedideaarena',
    ],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'ZedIdeaArena',
    description:
      'A fintech-style idea competition and crowdfunding platform. Pitch your ideas, compete with others, and win funding.',
    publisher: { '@id': `${BASE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/competitions?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function webApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${BASE_URL}/#webapplication`,
    url: BASE_URL,
    name: 'ZedIdeaArena',
    description:
      'Pitch your innovative ideas, compete in prize-driven competitions, and win funding. Voters judge entries and earn rewards.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Modern browser recommended.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Account',
        price: '0',
        priceCurrency: 'USD',
        description: 'Create an account for free. No credit card needed.',
      },
      {
        '@type': 'Offer',
        name: 'Voter Fee',
        price: '15.00',
        priceCurrency: 'USD',
        description: 'One-time fee to vote on all competitions.',
      },
      {
        '@type': 'Offer',
        name: 'Contestant Entry Fee',
        price: '5.00',
        priceCurrency: 'USD',
        description: 'Entry fee per competition. Goes entirely to the prize pool.',
      },
    ],
    featureList: [
      'Pitch your innovative ideas',
      'Compete in prize-driven competitions',
      'Vote on community submissions',
      'Earn rewards for picking winners',
      'KYC identity verification',
      'Win prize pool distributions: 25%/10%/5% for top 3',
    ],
    screenshot: `${BASE_URL}/og-default.png`,
  }
}

export function personSchema(name: string, role: string, bio: string, image: string, url?: string) {
  return {
    '@type': 'Person',
    name,
    jobTitle: role,
    description: bio,
    image: `${BASE_URL}${image}`,
    ...(url ? { url } : {}),
  }
}

export function teamSchemas() {
  const team = [
    {
      name: 'Sean Tinashe Nyakutira',
      role: 'Founder & CEO',
      bio: 'Lead developer and visionary behind ZedIdeaArena. Building the future of African innovation.',
      image: '/team/sean.jpg',
      url: 'https://mrseannyakutira.com',
    },
    {
      name: 'Brendon Svotwa',
      role: 'Head of Operations',
      bio: 'Scaling the platform and managing day-to-day operations across Southern Africa.',
      image: '/team/brendon.jpg',
      url: 'https://brendonsvotwa.vercel.app',
    },
    {
      name: 'Chenai Chipato',
      role: 'Community Lead',
      bio: 'Growing the innovator network and building partnerships across the region.',
      image: '/team/chenai.svg',
    },
    {
      name: 'Tyler B Picolani',
      role: 'Assistant Developer',
      bio: 'Building and maintaining platform features for a seamless experience.',
      image: '/team/tyler.svg',
    },
    {
      name: 'Calvin Mupazviriwo',
      role: 'Marketing Director',
      bio: 'Driving growth and brand awareness across Southern Africa and beyond.',
      image: '/team/calvin.jpg',
    },
  ]

  return team.map((m) => personSchema(m.name, m.role, m.bio, m.image, m.url))
}

export function faqSchema(questions: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE_URL}/how-it-works/#faq`,
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}
