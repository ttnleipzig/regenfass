// Atoms
export { Badge } from "./components/atoms/Badge.tsx";
export { Button } from "./components/atoms/Button.tsx";
export { ButtonAction } from "./components/atoms/ButtonAction.tsx";
export { ButtonModeToggle } from "./components/atoms/ButtonModeToggle.tsx";
export { ButtonPrimary } from "./components/atoms/ButtonPrimary.tsx";
export { ButtonSecondary } from "./components/atoms/ButtonSecondary.tsx";
export { ButtonSoundToggle } from "./components/atoms/ButtonSoundToggle.tsx";
export { default as Confetti, CONFETTI_PARTICLE_COUNT } from "./components/atoms/Confetti.tsx";
export { Headline } from "./components/atoms/Headline.tsx";
export { default as Link } from "./components/atoms/Link.tsx";
export { Progress } from "./components/atoms/Progress.tsx";
export { Spinner } from "./components/atoms/Spinner.tsx";
export { default as SpinnerConfetti } from "./components/atoms/SpinnerConfetti.tsx";
export { default as Status } from "./components/atoms/Status.tsx";

// Molecules
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/molecules/AlertDialog.tsx";
export {
  AlertInline,
  AlertTitle,
  AlertDescription,
  alertVariants,
} from "./components/molecules/AlertInline.tsx";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/molecules/Card.tsx";
export { ErrorList } from "./components/molecules/ErrorList.tsx";
export {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  OTPFieldSlot,
} from "./components/molecules/OTPField.tsx";
export { StepPaginator } from "./components/molecules/StepPaginator.tsx";

// Organisms
export { default as Header } from "./components/organisms/Header.tsx";
export type { HeaderNavItem, HeaderProps } from "./components/organisms/Header.tsx";
export { default as Footer } from "./components/organisms/Footer.tsx";
export { default as Newsletter } from "./components/organisms/Newsletter.tsx";

// Forms
export { AppKeyHexField } from "./components/forms/AppKeyHexField.tsx";
export type { AppKeyHexFieldProps } from "./components/forms/AppKeyHexField.tsx";
export { Checkbox } from "./components/forms/Checkbox.tsx";
export { FileUploader } from "./components/forms/FileUploader.tsx";
export { FormField } from "./components/forms/FormField.tsx";
export { FormLayout } from "./components/forms/FormLayout.tsx";
export { InputField } from "./components/forms/InputField.tsx";
export { Select } from "./components/forms/Select.tsx";
export {
  SelectField,
  SelectContent,
  SelectDescription,
  SelectErrorMessage,
  SelectHiddenSelect,
  SelectItem,
  SelectItemDescription,
  SelectSection,
  SelectTrigger,
  SelectValue,
} from "./components/forms/SelectField.tsx";
export {
  TextField,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
  TextFieldRoot,
} from "./components/forms/TextField.tsx";
export { TextInput } from "./components/forms/TextInput.tsx";

// Utils
export { cn } from "./libs/cn.ts";
export {
  soundEnabled,
  isSoundEnabled,
  setSoundEnabled,
  toggleSoundEnabled,
  resetSoundPreferenceForTests,
} from "./libs/soundPreference.ts";
export {
  buildSlotReelRows,
  formatAppKeyHexPairs,
  maskAppKeyFormattedForDisplay,
  maskHexPairForDisplay,
  normalizeAppKeyHexInput,
  randomFormattedAppKeyPreview,
  randomHexString,
  splitCanonicalHexPairs,
} from "./libs/hexKeyDisplay.ts";
export { copyTextToClipboard } from "./libs/copyToClipboard.ts";
export {
  playSlotRevealFinishSound,
  warmUpSlotAudio,
  resetSlotAudioForTests,
} from "./libs/slotRevealSound.ts";
export {
  getAudioContext,
  resumeAudioContext,
  resetWebAudioContextForTests,
} from "./libs/webAudioContext.ts";
export {
  playCameraCopySound,
  resetCameraCopySoundForTests,
} from "./libs/cameraCopySound.ts";
