declare module 'react/compiler-runtime' {
  export function c(size: number): any[];
}

declare global {
  const MACRO: {
    VERSION: string;
    PACKAGE_URL: string;
    NATIVE_PACKAGE_URL: string;
    BUILD_TIME: string;
    FEEDBACK_CHANNEL: string;
    VERSION_CHANGELOG: string;
    ISSUES_EXPLAINER: string;
  };
}

export {};
