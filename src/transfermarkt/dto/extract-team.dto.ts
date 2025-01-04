import { ApiProperty } from "@nestjs/swagger";

// DTOs
export class ExtractTransferMarktTeamDto {
    @ApiProperty({
        description: 'HTML content from Transfermarkt team page',
        required: true,
        type: String
    })
    html: string;
}

export class TeamImage {
    @ApiProperty({ example: 'https://tmssl.akamaized.net//images/wappen/head/27.png' })
    url: string;

    @ApiProperty({ example: 'Bayern Munich' })
    alt: string;
}

export class LeagueCountry {
    @ApiProperty({ example: 'Germany' })
    name: string;

    @ApiProperty({ example: 'https://tmssl.akamaized.net/images/flagge/tiny/40.png' })
    flag: string;
}

export class TeamLeague {
    @ApiProperty({ example: 'Bundesliga' })
    name: string;

    @ApiProperty({ example: '/bundesliga/startseite/wettbewerb/L1' })
    link: string;

    @ApiProperty({ example: 'https://tmssl.akamaized.net/images/logo/normal/l1.png' })
    logo: string;

    @ApiProperty({ example: 'First Tier' })
    level: string;

    @ApiProperty()
    country: LeagueCountry;
}

export class Foreigners {
    @ApiProperty({ example: '16' })
    count: string;

    @ApiProperty({ example: '59.3 %' })
    percentage: string;

    @ApiProperty({ example: '/bayern-munich/legionaere/verein/27' })
    link: string;
}

export class NationalTeamPlayers {
    @ApiProperty({ example: '17' })
    count: string;

    @ApiProperty({ example: '/bayern-munich/nationalspieler/verein/27' })
    link: string;
}

export class Stadium {
    @ApiProperty({ example: 'Allianz Arena' })
    name: string;

    @ApiProperty({ example: '/fc-bayern-munchen/stadion/verein/27' })
    nameLink: string;

    @ApiProperty({ example: '75.000 Seats' })
    capacity: string;
}

export class CurrentTransferRecord {
    @ApiProperty({ example: '€-67.65m' })
    value: string;

    @ApiProperty({ example: '/bayern-munich/transfers/verein/27/saison_id/2024' })
    link: string;
}

export class MarketValue {
    @ApiProperty({ example: '887.00' })
    total: string;

    @ApiProperty({ example: '€' })
    currency: string;

    @ApiProperty({ example: '/bayern-munich/kader/verein/27' })
    link: string;
}

export class LeaguePosition {
    @ApiProperty({ example: '1' })
    position: string;

    @ApiProperty({ example: '/bundesliga/tabelle/wettbewerb/L1' })
    link: string;
}

export class LeagueHistory {
    @ApiProperty({ example: '60 years' })
    years: string;

    @ApiProperty({ example: '/bayern-munich/platzierungen/verein/27' })
    link: string;
}

export class CurrentStats {
    @ApiProperty({ example: '27' })
    squadSize: string;

    @ApiProperty({ example: '27.0' })
    averageAge: string;

    @ApiProperty()
    foreigners: Foreigners;

    @ApiProperty()
    nationalTeamPlayers: NationalTeamPlayers;

    @ApiProperty()
    stadium: Stadium;

    @ApiProperty()
    currentTransferRecord: CurrentTransferRecord;
}

export class Achievement {
    @ApiProperty({ example: 'Champions League Winner' })
    title: string;

    @ApiProperty({ example: '/bayern-munich/erfolge/verein/27' })
    titleLink: string;

    @ApiProperty({ example: '3' })
    count: string;

    @ApiProperty({ example: 'https://tmssl.akamaized.net/images/erfolge/header/4.png' })
    imageUrl: string;
}

export class TransferStats {
    @ApiProperty()
    income: {
        count: number;
        value: string;
    };

    @ApiProperty()
    expenditure: {
        count: number;
        value: string;
    };

    @ApiProperty({ example: '€-67.65m' })
    balance: string;
}

export class PlayerTransfer {
    @ApiProperty()
    player: {
        name: string;
        link: string;
        image: string;
        position: string;
        age: string;
    };

    @ApiProperty()
    nationality: {
        primary: { name: string; flag: string; };
        secondary?: { name: string; flag: string; };
    };

    @ApiProperty()
    club: {
        name: string;
        link: string;
        logo: string;
        league: {
            name: string;
            link: string;
        };
    };

    @ApiProperty()
    fee: {
        amount: string;
        link: string;
    };
}

export class TransferInfo {
    @ApiProperty({ example: '2023' })
    season: string;

    @ApiProperty({ type: [PlayerTransfer] })
    arrivals: PlayerTransfer[];

    @ApiProperty({ type: [PlayerTransfer] })
    departures: PlayerTransfer[];

    @ApiProperty()
    stats: TransferStats;
}

export class TopPlayer {
    @ApiProperty({ example: 'Harry Kane' })
    name: string;

    @ApiProperty({ example: '/harry-kane/profil/spieler/132098' })
    link: string;

    @ApiProperty({ example: 'Centre-Forward' })
    position: string;

    @ApiProperty({ example: '14' })
    value: string;
}

export class TopScorers {
    @ApiProperty({ type: [TopPlayer] })
    goals: TopPlayer[];

    @ApiProperty({ type: [TopPlayer] })
    assists: TopPlayer[];
}

export class TeamBasics {
    @ApiProperty({ example: 'Bayern Munich' })
    name: string;

    @ApiProperty({ example: '/bayern-munich/startseite/verein/27' })
    nameLink: string;

    @ApiProperty()
    image: TeamImage;

    @ApiProperty()
    league: TeamLeague;

    @ApiProperty()
    currentStats: CurrentStats;

    @ApiProperty()
    marketValue: MarketValue;

    @ApiProperty()
    leaguePosition: LeaguePosition;

    @ApiProperty()
    leagueHistory: LeagueHistory;
}

export class StaffMember {
    @ApiProperty({ example: 'Thomas Tuchel' })
    name: string;

    @ApiProperty({ example: '/thomas-tuchel/profil/trainer/7471' })
    link: string;

    @ApiProperty({ example: 'Manager' })
    role: string;

    @ApiProperty({ example: 'https://img.a.transfermarkt.technology/portrait/header/7471-1684933384.jpg' })
    image: string;

    @ApiProperty({ example: 'Germany' })
    nationality: string;

    @ApiProperty({ example: 'https://tmssl.akamaized.net/images/flagge/tiny/40.png' })
    nationalityFlag: string;
}

export class TeamFacts {
    @ApiProperty({ example: 'FC Bayern München' })
    officialName: string;

    @ApiProperty({ example: 'Säbener Straße 51-57' })
    address: string;

    @ApiProperty({ example: '81547 München' })
    postalCode: string;

    @ApiProperty({ example: 'Germany' })
    country: string;

    @ApiProperty({ example: '+49 89 69931-0' })
    phone: string;

    @ApiProperty({ example: '+49 89 644165' })
    fax: string;

    @ApiProperty({ example: 'fcbayern.com' })
    website: string;

    @ApiProperty({ example: 'Feb 27, 1900' })
    founded: string;

    @ApiProperty({ example: '360.000' })
    members: string;
}

export class SeasonRecord {
    @ApiProperty()
    competition: {
        name: string;
        link: string;
    };

    @ApiProperty({ example: 'Semi-Finals' })
    achievement: string;
}

export class RelatedTeam {
    @ApiProperty({ example: 'FC Bayern Munich II' })
    name: string;

    @ApiProperty({ example: '/fc-bayern-munchen-ii/startseite/verein/28' })
    link: string;

    @ApiProperty({ example: 'https://tmssl.akamaized.net/images/wappen/tiny/28.png' })
    logo: string;
}

export class TeamResponse {
    @ApiProperty()
    basics: TeamBasics;

    @ApiProperty({ type: [Achievement] })
    achievements: Achievement[];

    @ApiProperty()
    transfers: TransferInfo;

    @ApiProperty()
    topPlayers: TopScorers;

    @ApiProperty({ type: [StaffMember] })
    staff: StaffMember[];

    @ApiProperty()
    facts: TeamFacts;

    @ApiProperty({ type: [SeasonRecord] })
    seasonRecord: SeasonRecord[];

    @ApiProperty({ type: [RelatedTeam] })
    relatedTeams: RelatedTeam[];
}