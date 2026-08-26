import type { JSX } from "solid-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertInline,
  AppKeyHexField,
  Badge,
  Button,
  ButtonToggleMode,
  ButtonToggleSound,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Confetti,
  ErrorList,
  FileUploader,
  Footer,
  FormField,
  FormLayout,
  Header,
  Headline,
  InputField,
  Link,
  Newsletter,
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  OTPFieldSlot,
  Progress,
  Select,
  SelectContent,
  SelectField,
  SelectTrigger,
  SelectValue,
  Spinner,
  SpinnerConfetti,
  Status,
  StepPaginator,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
  TextFieldRoot,
  TextInput,
} from "@regenfass/brand";

export type PlaygroundCategory = "atoms" | "molecules" | "forms" | "organisms";

export type PlaygroundControlType = "text" | "boolean" | "number" | "range" | "select";

export type PlaygroundControl = {
  key: string;
  label: string;
  type: PlaygroundControlType;
  defaultValue: string | boolean | number;
  options?: string[];
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
};

export type PlaygroundComponent = {
  slug: string;
  name: string;
  category: PlaygroundCategory;
  description: string;
  controls: PlaygroundControl[];
  render: (values: Record<string, string | boolean | number>) => JSX.Element;
  code?: (values: Record<string, string | boolean | number>) => string;
};

function escapeJsxText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeJsxAttribute(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

export const PLAYGROUND_COMPONENTS: PlaygroundComponent[] = [
  {
    slug: "button",
    name: "Button",
    category: "atoms",
    description: "Button with semantic variants, sizes, and loading state.",
    controls: [
      { key: "children", label: "Text", type: "text", defaultValue: "Click me" },
      {
        key: "variant",
        label: "Variant",
        type: "select",
        defaultValue: "primary",
        options: ["primary", "secondary", "default", "outline", "ghost", "destructive", "link"],
      },
      {
        key: "size",
        label: "Size",
        type: "select",
        defaultValue: "default",
        options: ["default", "sm", "lg", "icon"],
      },
      { key: "loading", label: "Loading", type: "boolean", defaultValue: false },
      { key: "disabled", label: "Disabled", type: "boolean", defaultValue: false },
    ],
    render: (values) => (
      <Button
        variant={String(values.variant) as "primary" | "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"}
        size={String(values.size) as "default" | "sm" | "lg" | "icon"}
        loading={Boolean(values.loading)}
        disabled={Boolean(values.disabled)}
      >
        {String(values.children)}
      </Button>
    ),
  },
  {
    slug: "badge",
    name: "Badge",
    category: "atoms",
    description: "Small status label.",
    controls: [
      { key: "children", label: "Text", type: "text", defaultValue: "New" },
      {
        key: "variant",
        label: "Variant",
        type: "select",
        defaultValue: "default",
        options: ["default", "secondary", "destructive", "outline"],
      },
    ],
    render: (values) => (
      <Badge variant={String(values.variant) as "default" | "secondary" | "destructive" | "outline"}>
        {String(values.children)}
      </Badge>
    ),
  },
  {
    slug: "headline",
    name: "Headline",
    category: "atoms",
    description: "Structured heading with optional subtitle.",
    controls: [
      { key: "children", label: "Title", type: "text", defaultValue: "Water level is stable" },
      {
        key: "as",
        label: "HTML tag",
        type: "select",
        defaultValue: "h2",
        options: ["h1", "h2", "h3", "h4"],
      },
      {
        key: "align",
        label: "Alignment",
        type: "select",
        defaultValue: "left",
        options: ["left", "center", "right"],
      },
      { key: "subtitle", label: "Subtitle", type: "text", defaultValue: "Last update 2 minutes ago" },
    ],
    render: (values) => (
      <Headline
        as={String(values.as) as "h1" | "h2" | "h3" | "h4"}
        align={String(values.align) as "left" | "center" | "right"}
        subtitle={String(values.subtitle) || undefined}
      >
        {String(values.children)}
      </Headline>
    ),
  },
  {
    slug: "link",
    name: "Link",
    category: "atoms",
    description: "Styled text link.",
    controls: [
      { key: "children", label: "Text", type: "text", defaultValue: "Open docs" },
      { key: "href", label: "Href", type: "text", defaultValue: "https://docs.regenfass.eu/" },
      { key: "targetBlank", label: "Open in new tab", type: "boolean", defaultValue: true },
    ],
    render: (values) => (
      <Link
        href={String(values.href)}
        target={Boolean(values.targetBlank) ? "_blank" : undefined}
        rel={Boolean(values.targetBlank) ? "noreferrer" : undefined}
      >
        {String(values.children)}
      </Link>
    ),
  },
  {
    slug: "progress",
    name: "Progress",
    category: "atoms",
    description: "Progress indicator for multi-step flows.",
    controls: [{ key: "value", label: "Value", type: "range", defaultValue: 55, min: 0, max: 100 }],
    render: (values) => <Progress value={Number(values.value)} class="max-w-sm" />,
    code: (values) => `<Progress value={${Number(values.value)}} />`,
  },
  {
    slug: "status",
    name: "Status",
    category: "atoms",
    description: "Inline health/status indicator.",
    controls: [
      {
        key: "status",
        label: "Status",
        type: "select",
        defaultValue: "success",
        options: ["idle", "loading", "success", "error"],
      },
      { key: "message", label: "Message", type: "text", defaultValue: "Connected" },
    ],
    render: (values) => (
      <Status
        status={String(values.status) as "idle" | "loading" | "success" | "error"}
        message={String(values.message)}
      />
    ),
    code: (values) => `<Status status="${escapeJsxAttribute(String(values.status))}" message="${escapeJsxAttribute(String(values.message))}" />`,
  },
  {
    slug: "alert-inline",
    name: "AlertInline",
    category: "molecules",
    description: "Inline alert for contextual feedback.",
    controls: [
      { key: "children", label: "Text", type: "text", defaultValue: "Settings were saved." },
      {
        key: "variant",
        label: "Variant",
        type: "select",
        defaultValue: "success",
        options: ["default", "destructive", "info", "warning", "success"],
      },
      { key: "showIcon", label: "Show icon", type: "boolean", defaultValue: true },
    ],
    render: (values) => (
      <AlertInline
        variant={String(values.variant) as "default" | "destructive" | "info" | "warning" | "success"}
        showIcon={Boolean(values.showIcon)}
      >
        {String(values.children)}
      </AlertInline>
    ),
  },
  {
    slug: "card",
    name: "Card",
    category: "molecules",
    description: "Content container with title and description.",
    controls: [
      { key: "title", label: "Title", type: "text", defaultValue: "Rain Barrel" },
      { key: "description", label: "Description", type: "text", defaultValue: "LoRaWAN water level sensor" },
      { key: "content", label: "Content", type: "text", defaultValue: "Current fill level: 78%" },
    ],
    render: (values) => (
      <Card class="max-w-md">
        <CardHeader>
          <CardTitle>{String(values.title)}</CardTitle>
          <CardDescription>{String(values.description)}</CardDescription>
        </CardHeader>
        <CardContent>{String(values.content)}</CardContent>
      </Card>
    ),
    code: (values) => `<Card>\n  <CardHeader>\n    <CardTitle>${escapeJsxText(String(values.title))}</CardTitle>\n    <CardDescription>${escapeJsxText(String(values.description))}</CardDescription>\n  </CardHeader>\n  <CardContent>${escapeJsxText(String(values.content))}</CardContent>\n</Card>`,
  },
  {
    slug: "step-paginator",
    name: "StepPaginator",
    category: "molecules",
    description: "Stepper for installation and configuration flows.",
    controls: [
      { key: "title", label: "Title", type: "text", defaultValue: "Installation steps" },
      {
        key: "variant",
        label: "Variant",
        type: "select",
        defaultValue: "default",
        options: ["default", "compact"],
      },
      { key: "activeStep", label: "Active step", type: "range", defaultValue: 2, min: 1, max: 4 },
    ],
    render: (values) => (
      <StepPaginator
        title={String(values.title)}
        variant={String(values.variant) as "default" | "compact"}
        activeStep={Number(values.activeStep)}
        steps={["Connect", "Install", "Configure", "Finish"]}
      />
    ),
  },
  {
    slug: "text-input",
    name: "TextInput",
    category: "forms",
    description: "Labeled text input with validation styling.",
    controls: [
      { key: "label", label: "Label", type: "text", defaultValue: "Device name" },
      { key: "placeholder", label: "Placeholder", type: "text", defaultValue: "My rain barrel" },
      { key: "value", label: "Value", type: "text", defaultValue: "" },
      { key: "disabled", label: "Disabled", type: "boolean", defaultValue: false },
    ],
    render: (values) => (
      <div class="max-w-sm">
        <TextInput
          label={String(values.label)}
          placeholder={String(values.placeholder)}
          value={String(values.value)}
          disabled={Boolean(values.disabled)}
        />
      </div>
    ),
    code: (values) => `<TextInput
  label="${escapeJsxAttribute(String(values.label))}"
  placeholder="${escapeJsxAttribute(String(values.placeholder))}"
  value="${escapeJsxAttribute(String(values.value))}"
  disabled={${Boolean(values.disabled)}}
/>`,
  },
  {
    slug: "input-field",
    name: "InputField",
    category: "forms",
    description: "Raw form input field used by composed form controls.",
    controls: [
      { key: "placeholder", label: "Placeholder", type: "text", defaultValue: "Type a value" },
      { key: "value", label: "Value", type: "text", defaultValue: "" },
      { key: "disabled", label: "Disabled", type: "boolean", defaultValue: false },
    ],
    render: (values) => (
      <div class="max-w-sm">
        <InputField
          placeholder={String(values.placeholder)}
          value={String(values.value)}
          disabled={Boolean(values.disabled)}
        />
      </div>
    ),
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "forms",
    description: "Checkbox with optional label and helper text.",
    controls: [
      { key: "label", label: "Label", type: "text", defaultValue: "Enable low-power mode" },
      { key: "checked", label: "Checked", type: "boolean", defaultValue: true },
      { key: "helperText", label: "Helper text", type: "text", defaultValue: "Recommended for battery use" },
    ],
    render: (values) => (
      <div class="max-w-sm">
        <Checkbox
          label={String(values.label)}
          checked={Boolean(values.checked)}
          helperText={String(values.helperText)}
        />
      </div>
    ),
  },
  {
    slug: "button-toggle-mode",
    name: "ButtonToggleMode",
    category: "atoms",
    description: "Toggle between light and dark color modes.",
    controls: [],
    render: () => <ButtonToggleMode />,
  },
  {
    slug: "button-toggle-sound",
    name: "ButtonToggleSound",
    category: "atoms",
    description: "Toggle sound feedback preferences.",
    controls: [],
    render: () => <ButtonToggleSound />,
  },
  {
    slug: "confetti",
    name: "Confetti",
    category: "atoms",
    description: "Full-screen celebratory confetti burst.",
    controls: [{ key: "active", label: "Active", type: "boolean", defaultValue: false }],
    render: (values) => <Confetti active={Boolean(values.active)} />,
  },
  {
    slug: "spinner",
    name: "Spinner",
    category: "atoms",
    description: "Animated loading indicator.",
    controls: [{ key: "size", label: "Size", type: "select", defaultValue: "md", options: ["sm", "md", "lg"] }],
    render: (values) => <Spinner size={String(values.size) as "sm" | "md" | "lg"} />,
    code: (values) => `<Spinner size="${escapeJsxAttribute(String(values.size))}" />`,
  },
  {
    slug: "spinner-confetti",
    name: "SpinnerConfetti",
    category: "atoms",
    description: "Loading indicator with animated confetti accents.",
    controls: [],
    render: () => <SpinnerConfetti />,
  },
  {
    slug: "app-key-hex-field",
    name: "AppKeyHexField",
    category: "forms",
    description: "Masked AppKey editor with reveal, copy, and reset actions.",
    controls: [
      { key: "value", label: "AppKey", type: "text", defaultValue: "00112233445566778899AABBCCDDEEFF" },
      { key: "showCopyButton", label: "Show copy", type: "boolean", defaultValue: true },
      { key: "showResetButton", label: "Show reset", type: "boolean", defaultValue: true },
    ],
    render: (values) => (
      <AppKeyHexField
        id="playground-app-key"
        name="appKey"
        value={String(values.value)}
        onCanonicalChange={() => undefined}
        showCopyButton={Boolean(values.showCopyButton)}
        showResetButton={Boolean(values.showResetButton)}
      />
    ),
    code: (values) => `<AppKeyHexField\n  id="playground-app-key"\n  name="appKey"\n  value="${escapeJsxAttribute(String(values.value))}"\n  showCopyButton={${Boolean(values.showCopyButton)}}\n  showResetButton={${Boolean(values.showResetButton)}}\n/>`,
  },
  {
    slug: "file-uploader",
    name: "FileUploader",
    category: "forms",
    description: "File input with helper, error, and selected-file states.",
    controls: [
      { key: "label", label: "Label", type: "text", defaultValue: "Firmware file" },
      { key: "helperText", label: "Helper text", type: "text", defaultValue: "Choose a .bin file" },
      { key: "multiple", label: "Multiple files", type: "boolean", defaultValue: false },
    ],
    render: (values) => (
      <div class="max-w-lg">
        <FileUploader
          label={String(values.label)}
          helperText={String(values.helperText)}
          multiple={Boolean(values.multiple)}
        />
      </div>
    ),
  },
  {
    slug: "form-field",
    name: "FormField",
    category: "forms",
    description: "Label, content, helper, and error layout for form controls.",
    controls: [
      { key: "label", label: "Label", type: "text", defaultValue: "Device name" },
      { key: "helperText", label: "Helper text", type: "text", defaultValue: "Use a descriptive name" },
      { key: "error", label: "Error", type: "text", defaultValue: "" },
    ],
    render: (values) => (
      <div class="max-w-sm">
        <FormField
          label={String(values.label)}
          helperText={String(values.helperText)}
          error={String(values.error) || undefined}
        >
          <InputField placeholder="My rain barrel" />
        </FormField>
      </div>
    ),
  },
  {
    slug: "form-layout",
    name: "FormLayout",
    category: "forms",
    description: "Consistent layout for titled forms and their actions.",
    controls: [
      { key: "title", label: "Title", type: "text", defaultValue: "Device settings" },
      { key: "subtitle", label: "Subtitle", type: "text", defaultValue: "Update your device details." },
    ],
    render: (values) => (
      <div class="max-w-lg">
        <FormLayout
          title={String(values.title)}
          subtitle={String(values.subtitle)}
          actions={<Button variant="primary" type="submit">Save</Button>}
        >
          <InputField placeholder="Device name" />
          <Checkbox label="Enable notifications" />
        </FormLayout>
      </div>
    ),
  },
  {
    slug: "select",
    name: "Select",
    category: "forms",
    description: "Form-aware select control with label and validation states.",
    controls: [
      { key: "label", label: "Label", type: "text", defaultValue: "Sensor type" },
      { key: "placeholder", label: "Placeholder", type: "text", defaultValue: "Choose a sensor" },
    ],
    render: (values) => (
      <div class="max-w-sm">
        <Select
          label={String(values.label)}
          placeholder={String(values.placeholder)}
          options={["Ultrasonic", "ToF", "Manual"]}
          value="Ultrasonic"
        />
      </div>
    ),
  },
  {
    slug: "select-field",
    name: "SelectField",
    category: "forms",
    description: "Low-level select primitive for custom composed controls.",
    controls: [],
    render: () => (
      <div class="max-w-sm">
        <SelectField options={["Home", "Garden", "Community"]} placeholder="Choose a use case">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </SelectField>
      </div>
    ),
  },
  {
    slug: "text-field",
    name: "TextField",
    category: "forms",
    description: "Accessible low-level text field primitives.",
    controls: [
      { key: "label", label: "Label", type: "text", defaultValue: "Email address" },
      { key: "description", label: "Description", type: "text", defaultValue: "We will never share it." },
      { key: "invalid", label: "Invalid", type: "boolean", defaultValue: false },
    ],
    render: (values) => (
      <div class="max-w-sm">
        <TextFieldRoot validationState={Boolean(values.invalid) ? "invalid" : "valid"}>
          <TextFieldLabel>{String(values.label)}</TextFieldLabel>
          <TextFieldInput type="email" placeholder="you@example.com" />
          <TextFieldDescription>{String(values.description)}</TextFieldDescription>
          <TextFieldErrorMessage>Enter a valid email address.</TextFieldErrorMessage>
        </TextFieldRoot>
      </div>
    ),
  },
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    category: "molecules",
    description: "Modal confirmation dialog for potentially destructive actions.",
    controls: [
      { key: "trigger", label: "Trigger text", type: "text", defaultValue: "Delete device" },
      { key: "title", label: "Title", type: "text", defaultValue: "Delete this device?" },
      {
        key: "description",
        label: "Description",
        type: "text",
        defaultValue: "This action cannot be undone.",
      },
      { key: "action", label: "Action text", type: "text", defaultValue: "Confirm delete" },
    ],
    render: (values) => (
      <AlertDialog>
        <AlertDialogTrigger as={Button}>{String(values.trigger)}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{String(values.title)}</AlertDialogTitle>
            <AlertDialogDescription>{String(values.description)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{String(values.action)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    code: (values) => `<AlertDialog>\n  <AlertDialogTrigger as={Button}>${escapeJsxText(String(values.trigger))}</AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle>${escapeJsxText(String(values.title))}</AlertDialogTitle>\n      <AlertDialogDescription>${escapeJsxText(String(values.description))}</AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogAction>${escapeJsxText(String(values.action))}</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`,
  },
  {
    slug: "error-list",
    name: "ErrorList",
    category: "molecules",
    description: "Grouped error messages for form and installation failures.",
    controls: [
      { key: "title", label: "Title", type: "text", defaultValue: "Please fix these issues" },
      { key: "errors", label: "Errors", type: "text", defaultValue: "AppKey is required;Device is not connected" },
    ],
    render: (values) => (
      <div class="max-w-lg">
        <ErrorList
          title={String(values.title)}
          errors={String(values.errors).split(";").filter(Boolean)}
        />
      </div>
    ),
    code: (values) => {
      const errors = String(values.errors).split(";").filter(Boolean);

      return `<ErrorList\n  title="${escapeJsxAttribute(String(values.title))}"\n  errors={${JSON.stringify(errors)}}\n/>`;
    },
  },
  {
    slug: "otp-field",
    name: "OTPField",
    category: "forms",
    description: "Grouped one-time-password and device identifier input.",
    controls: [],
    render: () => (
      <OTPField maxLength={6} value="1234" onValueChange={() => undefined}>
        <OTPFieldInput aria-label="One-time code" />
        <OTPFieldGroup>
          <OTPFieldSlot index={0} />
          <OTPFieldSlot index={1} />
          <OTPFieldSlot index={2} />
        </OTPFieldGroup>
        <OTPFieldSeparator />
        <OTPFieldGroup>
          <OTPFieldSlot index={3} />
          <OTPFieldSlot index={4} />
          <OTPFieldSlot index={5} />
        </OTPFieldGroup>
      </OTPField>
    ),
  },
  {
    slug: "header",
    name: "Header",
    category: "organisms",
    description: "Responsive site header with navigation and color-mode toggle.",
    controls: [
      { key: "title", label: "Title", type: "text", defaultValue: "Regenfass" },
      { key: "titleSuffix", label: "Title suffix", type: "text", defaultValue: "Playground" },
    ],
    render: (values) => (
      <Header
        title={String(values.title)}
        titleSuffix={String(values.titleSuffix) || undefined}
        navItems={[{ href: "/", label: "Home" }]}
      />
    ),
    code: (values) => {
      const title = escapeJsxAttribute(String(values.title));
      const suffix = String(values.titleSuffix);

      return `<Header\n  title="${title}"${suffix ? `\n  titleSuffix="${escapeJsxAttribute(suffix)}"` : ""}\n/>`;
    },
  },
  {
    slug: "footer",
    name: "Footer",
    category: "organisms",
    description: "Shared footer with documentation, project, and release links.",
    controls: [],
    render: () => <Footer />,
  },
  {
    slug: "newsletter",
    name: "Newsletter",
    category: "organisms",
    description: "Newsletter signup form with success feedback state.",
    controls: [],
    render: () => <Newsletter />,
  },
];

export const PLAYGROUND_CATEGORIES: { id: PlaygroundCategory; title: string }[] = [
  { id: "atoms", title: "Atoms" },
  { id: "molecules", title: "Molecules" },
  { id: "forms", title: "Forms" },
  { id: "organisms", title: "Organisms" },
];

export function getPlaygroundComponent(slug: string) {
  return PLAYGROUND_COMPONENTS.find((entry) => entry.slug === slug);
}

export function getDefaultValues(component: PlaygroundComponent) {
  return Object.fromEntries(component.controls.map((control) => [control.key, control.defaultValue]));
}
