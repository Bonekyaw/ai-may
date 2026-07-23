export const locales = ["en", "my"] as const;

export type Locale = (typeof locales)[number];

export type TranslationKey =
  | "home"
  | "explore"
  | "profile"
  | "account"
  | "accountName"
  | "changeLanguage"
  | "english"
  | "myanmar"
  | "logOut"
  | "loggingOut"
  | "selectLanguage"
  | "cancel"
  | "currentLanguage"
  | "welcomeBack"
  | "loginSubtitle"
  | "loginWithGoogle"
  | "orContinueWith"
  | "email"
  | "password"
  | "passwordPlaceholder"
  | "forgotPassword"
  | "login"
  | "noAccount"
  | "signUp"
  | "createAccount"
  | "registerSubtitle"
  | "continueWithGoogle"
  | "fullName"
  | "fullNamePlaceholder"
  | "emailPlaceholder"
  | "passwordMinPlaceholder"
  | "createAccountButton"
  | "haveAccount"
  | "signIn"
  | "googleSignInFailed"
  | "invalidCredentials"
  | "sessionLoadFailed"
  | "registrationFailed"
  | "verificationSendFailed";

const en: Record<TranslationKey, string> = {
  home: "Home",
  explore: "Explore",
  profile: "Profile",
  account: "Account",
  accountName: "Name",
  changeLanguage: "Change language",
  english: "English",
  myanmar: "Myanmar",
  logOut: "Log out",
  loggingOut: "Logging out...",
  selectLanguage: "Select language",
  cancel: "Cancel",
  currentLanguage: "Language",
  welcomeBack: "Welcome back",
  loginSubtitle: "Login with your Google account or email",
  loginWithGoogle: "Login with Google",
  orContinueWith: "Or continue with",
  email: "Email",
  password: "Password",
  passwordPlaceholder: "Enter your password",
  forgotPassword: "Forgot your password?",
  login: "Login",
  noAccount: "Don't have an account?",
  signUp: "Sign up",
  createAccount: "Create your account",
  registerSubtitle: "Register with Google or your email address",
  continueWithGoogle: "Continue with Google",
  fullName: "Full name",
  fullNamePlaceholder: "Jane Doe",
  emailPlaceholder: "m@example.com",
  passwordMinPlaceholder: "At least 8 characters",
  createAccountButton: "Create account",
  haveAccount: "Already have an account?",
  signIn: "Sign in",
  googleSignInFailed: "Google sign-in failed.",
  invalidCredentials: "Invalid email or password.",
  sessionLoadFailed: "Signed in, but session could not be loaded. Please try again.",
  registrationFailed: "Registration failed.",
  verificationSendFailed: "Failed to send verification code.",
};

const my: Record<TranslationKey, string> = {
  home: "ပင်မ",
  explore: "ရှာဖွေရန်",
  profile: "ပရိုဖိုင်",
  account: "အကောင့်",
  accountName: "အမည်",
  changeLanguage: "ဘာသာစကား ပြောင်းရန်",
  english: "အင်္ဂလိပ်",
  myanmar: "မြန်မာ",
  logOut: "ထွက်ရန်",
  loggingOut: "ထွက်နေသည်...",
  selectLanguage: "ဘာသာစကား ရွေးပါ",
  cancel: "ပယ်ဖျက်ရန်",
  currentLanguage: "ဘာသာစကား",
  welcomeBack: "ပြန်လည်ကြိုဆိုပါတယ်",
  loginSubtitle: "Google အကောင့် သို့မဟုတ် အီးမေးလ်ဖြင့် ဝင်ရောက်ပါ",
  loginWithGoogle: "Google ဖြင့် ဝင်ရောက်ရန်",
  orContinueWith: "သို့မဟုတ် ဆက်လက်လုပ်ဆောင်ရန်",
  email: "အီးမေးလ်",
  password: "စကားဝှက်",
  passwordPlaceholder: "စကားဝှက် ထည့်ပါ",
  forgotPassword: "စကားဝှက် မေ့နေပါသလား?",
  login: "ဝင်ရောက်ရန်",
  noAccount: "အကောင့် မရှိသေးဘူးလား?",
  signUp: "စာရင်းသွင်းရန်",
  createAccount: "အကောင့် ဖန်တီးရန်",
  registerSubtitle: "Google သို့မဟုတ် အီးမေးလ်ဖြင့် စာရင်းသွင်းပါ",
  continueWithGoogle: "Google ဖြင့် ဆက်လုပ်ရန်",
  fullName: "အမည် အပြည့်အစုံ",
  fullNamePlaceholder: "Jane Doe",
  emailPlaceholder: "m@example.com",
  passwordMinPlaceholder: "အနည်းဆုံး စာလုံး ၈ လုံး",
  createAccountButton: "အကောင့် ဖန်တီးရန်",
  haveAccount: "အကောင့် ရှိပြီးသားလား?",
  signIn: "ဝင်ရောက်ရန်",
  googleSignInFailed: "Google ဖြင့် ဝင်ရောက်မှု မအောင်မြင်ပါ။",
  invalidCredentials: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေသည်။",
  sessionLoadFailed: "ဝင်ရောက်ပြီးသော်လည်း ဆက်ရှင် မရရှိပါ။ ထပ်မံကြိုးစားပါ။",
  registrationFailed: "စာရင်းသွင်းမှု မအောင်မြင်ပါ။",
  verificationSendFailed: "အတည်ပြုကုဒ် ပို့၍ မရပါ။",
};

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  my,
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "my";
}
