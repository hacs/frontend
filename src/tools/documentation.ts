export const documentationUrl = (options?: { path?: string; experimental?: boolean }) => {
  const domain = options?.experimental ? "experimental.hacs.xyz" : "www.hacs.xyz";
  return `https://${domain}${options?.path || ""}`;
};
