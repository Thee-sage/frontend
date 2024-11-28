export interface Casino {
    _id: string;
    name: string;
    description: string;
    logo: string;
    website: string;
    established: number;
    ourRating: number;
    userRating: {
      averageScore: number;
      totalVotes: number;
    };
    trustIndex: TrustIndex;
    categoryRatings: Array<{
      score: number;
      category: string;
      description: string;
      _id: string;
    }>;
    payoutRatio: {
      percentage: number;
      lastUpdated: string;
    };
    payoutSpeed: {
      averageDays: string;
      details: string;
    };
    licenses: string[];
    securityMeasures: string[];
    fairnessVerification: string[];
    paymentMethods: Array<{
      name: string;
      processingTime: string;
      minDeposit: number;
      maxWithdrawal: number;
      fees: string;
      _id: string;
    }>;
    currencies: string[];
    minDeposit: number;
    maxPayout: number;
    contentSections: Array<{
      title: string;
      content: string;
      order: number;
      _id: string;
    }>;
    advantages: string[];
    disadvantages: string[];
    offer: string;
    isActive: boolean;
    orderInListing: number;
  }
  
  export interface Ad {
    _id: string;
    title: string;
    description: string;
    link: string;
    imageUrl: string;
    rating: number;
    service: string;
    location: string;
    isShowInMainPage?: boolean;
    percentageInHomePage?: number;
    orderInCasinosPage?: number;
    casino: Casino;
  }
  
  export type TrustIndex = 'High' | 'Medium' | 'Low';
  