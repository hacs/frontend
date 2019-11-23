export const navigate = (
    _node: any,
    path: string
) => {
    history.pushState(null, "", path);
};