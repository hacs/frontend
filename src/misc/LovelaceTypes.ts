export interface LovelaceConfig {
    title?: string;
    views: LovelaceViewConfig[];
    background?: string;
    resources?: Array<{ type: "css" | "js" | "module" | "html"; url: string }>;
}

export interface LovelaceViewConfig {
    index?: number;
    title?: string;
    badges?: Array<string | LovelaceBadgeConfig>;
    cards?: LovelaceCardConfig[];
    path?: string;
    icon?: string;
    theme?: string;
    panel?: boolean;
    background?: string;
    visible?: boolean | ShowViewConfig[];
}

export interface ShowViewConfig {
    user?: string;
}

export interface LovelaceBadgeConfig {
    type?: string;
    [key: string]: any;
}

export interface LovelaceCardConfig {
    index?: number;
    view_index?: number;
    type: string;
    [key: string]: any;
}