export interface Route {
    path: string;
    prefix: string;
}

export interface Configuration {
    appdaemon: boolean;
    dev: string;
    frontend_mode: string;
    country: string;
    python_script: boolean;
    theme: boolean;
    version: string;
    categories: [string]
}

export interface Repository {
    domain: string;
    category: string;
    country: string;
    description: string
    hide: boolean;
    id: string;
    installed: boolean;
    name: string;
    status_description: string;
    status: string;
    state: string;
    new: string;
    additional_info: string;
    info: string;
    updated_info: boolean;
    beta: boolean;
    version_or_commit: string;
    custom: boolean;
    installed_version: string;
    available_version: string;
    main_action: string;
    pending_upgrade: boolean;
    javascript_type: string;
    full_name: string;
    file_name: string;
    local_path: string;
    authors: [string];
    topics: [string];
    releases: [string];
    selected_tag: string;
    default_branch: string;

}
