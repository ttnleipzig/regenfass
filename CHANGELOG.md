# Changelog

## [0.0.1](https://github.com/ttnleipzig/regenfass/compare/v0.1.0...v0.0.1) (2026-07-16)


### ⚠ BREAKING CHANGES

* reimplement web flasher WIP

### Features

* Add configuration form ([032c287](https://github.com/ttnleipzig/regenfass/commit/032c28777b4fc9043f03ead29fae58b2431cdd86))
* Add configuration handler ([d66f208](https://github.com/ttnleipzig/regenfass/commit/d66f208659a0c5a58af5ec0f6f8dc31fb85bd888))
* Add installation web page ([33f631b](https://github.com/ttnleipzig/regenfass/commit/33f631b062a0a57d1c6d074ac301ce265310ce77))
* Add release please for automated release pull requests and releases ([9a23f1c](https://github.com/ttnleipzig/regenfass/commit/9a23f1cdc02a7279dd9c3cd8e87cccee4472e4b9))
* Add release please for automatic release pull requests, release pages and upload of artifacts ([d8dc6c9](https://github.com/ttnleipzig/regenfass/commit/d8dc6c91eb12bae8a5f2ec434c06444b3a337dba))
* **alert:** add 'success' variant to AlertInline component ([b8f8e2f](https://github.com/ttnleipzig/regenfass/commit/b8f8e2f440c8fadebba95daffbd28bacef392f75))
* **alert:** add entrance animation for success icon when motion is not reduced ([0438803](https://github.com/ttnleipzig/regenfass/commit/04388033a9121f936314a71e1679a402bd966733))
* **app-key-hex-field:** enhance reveal animation with slot machine effect ([5833d38](https://github.com/ttnleipzig/regenfass/commit/5833d3884fc7e281b67d900b59089c6a9760ef9d))
* **AppKeyHexField.tsx:** implement overshoot effect in reel animation for more realistic spinning wheel experience ([3d502f9](https://github.com/ttnleipzig/regenfass/commit/3d502f9028ee82d6ea2aa474198dd41ebbb76f59))
* **AppKeyHexField:** add optional copy button to copy appKey to clipboard ([a07559c](https://github.com/ttnleipzig/regenfass/commit/a07559c846750cdbf5d10df09917fa4b45e325d6))
* **AppKeyHexField:** add optional reset button to clear appKey input ([cf8921a](https://github.com/ttnleipzig/regenfass/commit/cf8921ae76a986a260be0237ef49b5fd0a73aeda))
* **backend/api:** add swagger docs ([ac20ade](https://github.com/ttnleipzig/regenfass/commit/ac20ade87a969d00d983bf444c7ed7334ebf3704))
* **backend:** add device name and location columns ([0a4c9e2](https://github.com/ttnleipzig/regenfass/commit/0a4c9e20b37cdc26fc6050318b241a615527e52a))
* **backend:** add stable friendly device names ([ca7fcde](https://github.com/ttnleipzig/regenfass/commit/ca7fcde7c83cf81d4e20d7645cde6d719bf99b02))
* **backend:** allow overwriting the Swagger base URL ([85aec92](https://github.com/ttnleipzig/regenfass/commit/85aec92c4b0fd844fc8d43b83ec46492983de15e))
* **backend:** device info and update endpoints ([d16e6e9](https://github.com/ttnleipzig/regenfass/commit/d16e6e9118d7a8da933ce04663b8fad4ef2dbac5))
* **backend:** device registration ([02b8627](https://github.com/ttnleipzig/regenfass/commit/02b86270b61e9f36e883bcfe41ace9ed3c0c4959))
* **backend:** ingest the new data format ([bd572ef](https://github.com/ttnleipzig/regenfass/commit/bd572efe16811fa85d1168a258ea5fb251cd778a))
* **backend:** latest measurements and overview endpoints ([d943cd5](https://github.com/ttnleipzig/regenfass/commit/d943cd56dd4f08c829b926d35417bbb52e4ac62b))
* **backend:** persist device location from TTN uplinks ([6b3d137](https://github.com/ttnleipzig/regenfass/commit/6b3d1370d2e15741a17770fd87e735c8df004003))
* **backend:** provide health endpoint ([cd18359](https://github.com/ttnleipzig/regenfass/commit/cd18359a966d35792db7775432ee3710a81db611))
* **backend:** ranged downsampled device measurements ([1b1cd54](https://github.com/ttnleipzig/regenfass/commit/1b1cd541381190aa161bbe716b52bb5281abbafb))
* **badge.tsx:** create Badge component with variant support for UI consistency ([26bbe58](https://github.com/ttnleipzig/regenfass/commit/26bbe588257f6219725f5a240f39b707a8cefa6c))
* **card.tsx:** create Card component with header, title, description, content, and footer for structured UI elements ([26bbe58](https://github.com/ttnleipzig/regenfass/commit/26bbe588257f6219725f5a240f39b707a8cefa6c))
* **confetti:** enhance confetti animation with full-screen burst effect ([665833a](https://github.com/ttnleipzig/regenfass/commit/665833ad34ab5496d38c7658d766b78e4a3394c3))
* configuration reading ([c289ac3](https://github.com/ttnleipzig/regenfass/commit/c289ac3d8edb8ca5f54a8d0730b7c98caf7e4d31))
* configuration reading ([d429974](https://github.com/ttnleipzig/regenfass/commit/d429974ecd20bdb18455be41f0c0491a2b9dee0b))
* **Connect.tsx:** integrate Status component and add status checks for connection steps ([26bbe58](https://github.com/ttnleipzig/regenfass/commit/26bbe588257f6219725f5a240f39b707a8cefa6c))
* **docs:** add documentation for AppKeyHexField and OTP Field components ([5d1b97a](https://github.com/ttnleipzig/regenfass/commit/5d1b97a606394b05d9c964d0e8ed3af4ec163ba4))
* **firmware:** allow reporting of more data points per packet ([ca2c26d](https://github.com/ttnleipzig/regenfass/commit/ca2c26d1131632e5faee9c5e68c6723642313698))
* **firmware:** config version via SDP ([ec86976](https://github.com/ttnleipzig/regenfass/commit/ec86976c4c7764f9fd94849da14c281400cb9761))
* **Footer.tsx:** add mobile navigation links for Docs, GitHub, and Matrix to improve accessibility and user experience on smaller screens ([fa405bb](https://github.com/ttnleipzig/regenfass/commit/fa405bb471a81cc7139e8ab11279c3fa045f7045))
* **forms:** add stub components for various step forms to improve modularity ([83bdb20](https://github.com/ttnleipzig/regenfass/commit/83bdb204f2a9d12ea17d86c849d3c4583bfd95cc))
* **index.css, tailwind.config.js:** add new thematic colors for info and warning to enhance UI feedback ([0ebf57c](https://github.com/ttnleipzig/regenfass/commit/0ebf57c25349952acf400c59cb3ec0d7d71ec5a8))
* **index.tsx:** add ColorModeProvider and ColorModeScript for color mode management ([e0e3a8f](https://github.com/ttnleipzig/regenfass/commit/e0e3a8fe2ce49afc753981cac3db3282941def90))
* **installationActiveStep:** add utility to map XState node to active step ([83bdb20](https://github.com/ttnleipzig/regenfass/commit/83bdb204f2a9d12ea17d86c849d3c4583bfd95cc))
* **installer:** add components-org.json for Tailwind and alias config ([c1b4b1f](https://github.com/ttnleipzig/regenfass/commit/c1b4b1f52a717d0506654cdadaa7cb81341cd0a0))
* **installer:** add error sound feedback on configuration errors ([ca296e8](https://github.com/ttnleipzig/regenfass/commit/ca296e8348871b804b51203a7122091d3949fd74))
* **installer:** add IDs to configuration sections for better navigation ([eef66aa](https://github.com/ttnleipzig/regenfass/commit/eef66aaabdba5f693395da9b697d73435bccd181))
* **installer:** add IDs to configuration sections for better navigation ([25f0fdd](https://github.com/ttnleipzig/regenfass/commit/25f0fddce2817508e87d18ebdf1151ba85b6a149))
* **installer:** add linting scripts and improve documentation formatting ([3e10661](https://github.com/ttnleipzig/regenfass/commit/3e10661eb0bb571a402771a81e3bf37f9a5f1ff5))
* **installer:** add LoRaWANForm component for user input of LoRaWAN credentials ([c1b4b1f](https://github.com/ttnleipzig/regenfass/commit/c1b4b1f52a717d0506654cdadaa7cb81341cd0a0))
* **installer:** add modem sound effect after flash or config I/O ([934f595](https://github.com/ttnleipzig/regenfass/commit/934f595bd826438ebe89b0f0a0820e3b61aad79a))
* **installer:** add ModeToggle component to PlaygroundLayout for theme switching ([b4b3a93](https://github.com/ttnleipzig/regenfass/commit/b4b3a93e0badb8715c7c7b9e4eb30dd3efebaeea))
* **installer:** add multiple configuration and connection steps ([b512115](https://github.com/ttnleipzig/regenfass/commit/b51211509d4c0a211a0659d623d6d3f8672db300))
* **installer:** add Newsletter component to main app layout ([9eb2127](https://github.com/ttnleipzig/regenfass/commit/9eb212745727c00c0febfab680e47ed05d4c8129))
* **installer:** add Playwright for testing and configure dark mode ([9915183](https://github.com/ttnleipzig/regenfass/commit/9915183e4478a5a1189948d70950009fd194d54d))
* **installer:** add progress bar for configuration writing step to enhance user feedback ([fd5a199](https://github.com/ttnleipzig/regenfass/commit/fd5a199fae9f4fc8c3ced01020d4001f22287372))
* **installer:** add scp.mod.wasm file to support new module functionality ([6cd7801](https://github.com/ttnleipzig/regenfass/commit/6cd7801542748afd6440587e63ebbfe42fd644a9))
* **installer:** add scp.mod.wasm file to support new module functionality ([925cd8a](https://github.com/ttnleipzig/regenfass/commit/925cd8ac28a2d4fc133dd73987222f453c22c767))
* **installer:** add solid-icons dependency for enhanced UI components ([0ebf57c](https://github.com/ttnleipzig/regenfass/commit/0ebf57c25349952acf400c59cb3ec0d7d71ec5a8))
* **installer:** add support for SCP line parsing and encoding ([6cd7801](https://github.com/ttnleipzig/regenfass/commit/6cd7801542748afd6440587e63ebbfe42fd644a9))
* **installer:** add support for SCP line parsing and encoding ([925cd8a](https://github.com/ttnleipzig/regenfass/commit/925cd8ac28a2d4fc133dd73987222f453c22c767))
* **installer:** add utility function cn for class name merging using clsx and tailwind-merge ([c1b4b1f](https://github.com/ttnleipzig/regenfass/commit/c1b4b1f52a717d0506654cdadaa7cb81341cd0a0))
* **installer:** add vitest coverage support and update test configurations ([b1a1bce](https://github.com/ttnleipzig/regenfass/commit/b1a1bceb643c6bf963ccc08d1b507ff636ce98f6))
* **installer:** config reading ([1011389](https://github.com/ttnleipzig/regenfass/commit/1011389486aaec8d926f3d03e58de05366cd070e))
* **installer:** enhance CodeViewer with syntax highlighting using PrismJS ([3089a13](https://github.com/ttnleipzig/regenfass/commit/3089a135eb99ef091cbcbf7ad9ec1fdd9f1a0542))
* **installer:** enhance Playground components with local storage support and JSX improvements ([9e4462f](https://github.com/ttnleipzig/regenfass/commit/9e4462fead7cea78c4acbb8dc3878522164f9bfa))
* **installer:** enhance PropsPanel with example value filling and reset functionality ([f532c61](https://github.com/ttnleipzig/regenfass/commit/f532c614cb7f5d59dd732534dca9f97ef03719c8))
* **installer:** enhance StepConfigWritingConfiguration with UI components ([34b011e](https://github.com/ttnleipzig/regenfass/commit/34b011ecbcf6f46bff08ffb1e6d579421299437d))
* **installer:** enhance testing setup and add vitest integration ([4bc3a91](https://github.com/ttnleipzig/regenfass/commit/4bc3a91158b5ea9c40761918a5833c8b992113a3))
* **installer:** implement new features and improve the user interface ([4b65911](https://github.com/ttnleipzig/regenfass/commit/4b6591178a22d39b0a2b17f9fca8658e27441b13))
* **installer:** improve JSX detection and enhance component imports in Playground ([868799c](https://github.com/ttnleipzig/regenfass/commit/868799c040fe03e30e869c2a2bb1b0a28cb9373e))
* **installer:** integrate SolidJS router and enhance app structure ([2d24045](https://github.com/ttnleipzig/regenfass/commit/2d240454cdb72110d40e9b8e3b261336c588d59d))
* **installer:** update dependencies and improve README.md ([cb70f22](https://github.com/ttnleipzig/regenfass/commit/cb70f22ff3f0b8a655f122dc43d560b3aeb09569))
* **installer:** update dependencies and remove Storybook integration ([915fc46](https://github.com/ttnleipzig/regenfass/commit/915fc464c472d60d520d281da8d112119bfa31be))
* **installer:** working newsletter subscriptions ([a606af0](https://github.com/ttnleipzig/regenfass/commit/a606af02e4feec5e294678bc9f455e8c180fd9a7))
* **lora-wan:** Add LoraWAN functionality ([89d26a5](https://github.com/ttnleipzig/regenfass/commit/89d26a53ce4ef6cb61dc52aa774ca09261a457a3))
* **OTPField.tsx:** add new OTPField component with support for groups and separators ([bf8c632](https://github.com/ttnleipzig/regenfass/commit/bf8c63223aa310d95e7899ff196bbe466e22d729))
* **package.json:** add lucide-solid package for additional icon support ([26bbe58](https://github.com/ttnleipzig/regenfass/commit/26bbe588257f6219725f5a240f39b707a8cefa6c))
* **playground:** enhance component registry and add OTPField components ([1a8b2f0](https://github.com/ttnleipzig/regenfass/commit/1a8b2f0d7fb365355a7867aa4590b53b7677ecbd))
* **playground:** enhance component registry loading and default prop handling ([e1bb7a6](https://github.com/ttnleipzig/regenfass/commit/e1bb7a61beda141a58dedcbeaf1d917f3cc2f2b5))
* **playground:** refactor component rendering with enhanced error handling ([209311c](https://github.com/ttnleipzig/regenfass/commit/209311c3c87b20daaf37fcfa73271acdc54a377f))
* **Progress.tsx:** add new Progress component using Kobalte Progress ([bf8c632](https://github.com/ttnleipzig/regenfass/commit/bf8c63223aa310d95e7899ff196bbe466e22d729))
* **registry.json:** add Progress component to registry for better component tracking ([11f9400](https://github.com/ttnleipzig/regenfass/commit/11f94008c3a6ec90df9c4f76681de59f84f75272))
* **registry.json:** add Progress component to registry for better UI component tracking ([11f9400](https://github.com/ttnleipzig/regenfass/commit/11f94008c3a6ec90df9c4f76681de59f84f75272))
* **release:** unify version and surface changelogs on marketing ([8a5bb95](https://github.com/ttnleipzig/regenfass/commit/8a5bb95fd6f2cff2892f56347738f9c5eeffe068))
* **rules:** add architecture and documentation rules for consistency ([9915183](https://github.com/ttnleipzig/regenfass/commit/9915183e4478a5a1189948d70950009fd194d54d))
* **scp:** WASM module ([96ca6b1](https://github.com/ttnleipzig/regenfass/commit/96ca6b100454796ff1a315ea4ab673af76aa529d))
* **scp:** WASM module ([d3d0f52](https://github.com/ttnleipzig/regenfass/commit/d3d0f52744ff74bd1b16367a436434fbf6f83520))
* **selectors.js:** add new selectors for configuration connect button and form ([6cd7801](https://github.com/ttnleipzig/regenfass/commit/6cd7801542748afd6440587e63ebbfe42fd644a9))
* **selectors.js:** add new selectors for configuration connect button and form ([925cd8a](https://github.com/ttnleipzig/regenfass/commit/925cd8ac28a2d4fc133dd73987222f453c22c767))
* **sound-toggle.md:** update documentation to include camera shutter sound on copy ([35a14d7](https://github.com/ttnleipzig/regenfass/commit/35a14d7a195d65afb774a5b1ce36567c7cd0a47c))
* **sound-toggle:** add sound toggle button to control UI sounds ([f520e8c](https://github.com/ttnleipzig/regenfass/commit/f520e8c596a4dd5b0559fcffd6a83bc47f4741ce))
* **Status.tsx:** add new Status component to display status information ([2a83ace](https://github.com/ttnleipzig/regenfass/commit/2a83ace5e6ab8f0dbfdbf4be0635fee1c66dd493))
* **Status.tsx:** add Status component to display status bubbles with dynamic color changes ([26bbe58](https://github.com/ttnleipzig/regenfass/commit/26bbe588257f6219725f5a240f39b707a8cefa6c))
* **StepConfigEditing.tsx:** enhance UI with improved layout and styling ([9648892](https://github.com/ttnleipzig/regenfass/commit/96488926a02866c501f865a61cbaf331651540c3))
* **StepConfigEditing:** add "Save to device" button with icon for better user guidance ([9a6c834](https://github.com/ttnleipzig/regenfass/commit/9a6c834c006b15c2de6acff9252eae90901f3b68))
* **StepConfigEditing:** add copy to clipboard functionality for appEUI and devEUI fields ([67e1b61](https://github.com/ttnleipzig/regenfass/commit/67e1b618ab2f30bc6c74e8236f45dbccb126f4d5))
* **StepConfigEditing:** add file import functionality for config ([a92aab6](https://github.com/ttnleipzig/regenfass/commit/a92aab6019bc5d80f39e295f6bab60dbac8f3330))
* **StepConfigEditing:** implement config download as JSON ([713ead9](https://github.com/ttnleipzig/regenfass/commit/713ead973c38f4e3f0c7f471753656c13c20e615))
* **StepConnectReadingVersion.tsx:** integrate StepPaginator for better navigation ([83bdb20](https://github.com/ttnleipzig/regenfass/commit/83bdb204f2a9d12ea17d86c849d3c4583bfd95cc))
* **StepFinishShowingNextSteps:** add success icon and animations for improved user feedback ([57edd4f](https://github.com/ttnleipzig/regenfass/commit/57edd4f6cbd9584545d185fb7e8804dcddbca422))
* **StepInstallInstalling.tsx:** add progress indicator and spinner for firmware installation ([4c03a8f](https://github.com/ttnleipzig/regenfass/commit/4c03a8f964e0d0725987582328febb03a15f66ee))
* **StepInstallInstalling.tsx:** enhance success alert with new styles and animations for improved user feedback ([be2e632](https://github.com/ttnleipzig/regenfass/commit/be2e6326a79ff4ea17d23ef3223c87fd530ae2b0))
* **StepInstallInstalling:** add completion message and icon for successful firmware installation ([212bdc0](https://github.com/ttnleipzig/regenfass/commit/212bdc0cec0a7c3b29d515e8a8cce1cac8d36600))
* **StepInstallWaitingForInstallationMethodChoice.tsx:** add StepPaginator for improved user guidance ([83bdb20](https://github.com/ttnleipzig/regenfass/commit/83bdb204f2a9d12ea17d86c849d3c4583bfd95cc))
* **tsconfig.node.json:** include 'playwright.config.ts' for TypeScript compilation ([6fbe3b6](https://github.com/ttnleipzig/regenfass/commit/6fbe3b6ffea482755693186e78ffa69327fd44df))
* **types.ts:** define InstallerStateNames and FormProps for type safety ([83bdb20](https://github.com/ttnleipzig/regenfass/commit/83bdb204f2a9d12ea17d86c849d3c4583bfd95cc))
* **ui:** add Headline component for flexible heading elements ([e3970f8](https://github.com/ttnleipzig/regenfass/commit/e3970f8640a54f80e6ec5770f2b133d98064cdec))
* use LoRaWAN keys from config ([fe3feca](https://github.com/ttnleipzig/regenfass/commit/fe3feca35b534f53f38aa799487e66b251f73b36))
* use LoRaWAN keys from config ([fa1aa65](https://github.com/ttnleipzig/regenfass/commit/fa1aa656becd924489a1a6ec0a8e1a280eb973ee))
* version info ([421aef8](https://github.com/ttnleipzig/regenfass/commit/421aef8c3fdd6267f43a265819c810e02fae26d9))
* version info ([a1abf60](https://github.com/ttnleipzig/regenfass/commit/a1abf608dbb2ecdaa7dce75c643c419b9fbed37e))
* **web:** add marketing and docs SolidJS sites ([920f1ca](https://github.com/ttnleipzig/regenfass/commit/920f1ca60bef36c081d72f830b2f1b8bb1296285))
* **web:** add Swetrix analytics across Vite apps ([#17](https://github.com/ttnleipzig/regenfass/issues/17)) ([2e1a8f4](https://github.com/ttnleipzig/regenfass/commit/2e1a8f46881d85c2a7a4dfed569f21924c616b63))
* **web:** consolidate sites into pnpm workspace under web/ ([3ec3e9d](https://github.com/ttnleipzig/regenfass/commit/3ec3e9daf210d63d22e76701626d34658a0e5ef7))
* **web:** DE/EN i18n for marketing and installer ([#27](https://github.com/ttnleipzig/regenfass/issues/27)) ([11212dc](https://github.com/ttnleipzig/regenfass/commit/11212dc28b1852e9fcc3c76c5539f5ab1abb47bc))


### Bug Fixes

* **#11:** List artefacts before upload ([4f27f35](https://github.com/ttnleipzig/regenfass/commit/4f27f35d957a2ab648b45b1ba710d81af2b97323))
* **#11:** List artefacts before upload exactly ([37eafd0](https://github.com/ttnleipzig/regenfass/commit/37eafd04f8b774fa276767ef05b7b71f89732c3a))
* **#11:** List artefacts before upload exactly with package names ([16c04dc](https://github.com/ttnleipzig/regenfass/commit/16c04dcc773e96bd1d7805795d807ec1fc7a1b82))
* **#11:** List artefacts before upload exactly with package names with name ([88d58a8](https://github.com/ttnleipzig/regenfass/commit/88d58a88cf330362ab7432bc1ea50f0fdcdea463))
* **#11:** try to download the artifact before upload it ([4cdcc88](https://github.com/ttnleipzig/regenfass/commit/4cdcc8828812f06b0cd777240426b6b635d62b15))
* **#11:** Use different way to upload the artifacts ([bdb6aab](https://github.com/ttnleipzig/regenfass/commit/bdb6aab5fcfb35a26a92923767721354352376d5))
* **#11:** Use uploads to release pages ([f559207](https://github.com/ttnleipzig/regenfass/commit/f5592076318945d9e2b9435deea0d20854459481))
* **#11:** Use uploads to release pages dirk ([397976c](https://github.com/ttnleipzig/regenfass/commit/397976cb2bac92c19abeca92f6780b5f9d96d107))
* **#11:** Use uploads to release pages firmaware ([94f2680](https://github.com/ttnleipzig/regenfass/commit/94f2680b1c11266b8cb90988eaa95bda0b04b647))
* **#9:** Add hint how to contribute ([e709768](https://github.com/ttnleipzig/regenfass/commit/e7097688d5178966fc9b10d45404a7c7714a6174))
* **#9:** Add new line ([ad2518a](https://github.com/ttnleipzig/regenfass/commit/ad2518a94d5dd17653daa63e8ac1282c907b8cce))
* **alert:** correct success icon animation class for consistency ([0438803](https://github.com/ttnleipzig/regenfass/commit/04388033a9121f936314a71e1679a402bd966733))
* **backend:** CORS ([f64757b](https://github.com/ttnleipzig/regenfass/commit/f64757baba2ab5bebd23d26e67e0bfaddeb8bcbf))
* **backend:** foreign key constraint bug ([35c9e5e](https://github.com/ttnleipzig/regenfass/commit/35c9e5ee618d51fdf8b0bcc6e91a84b66a4da33a))
* **backend:** measurements failing to insert ([0d44bf5](https://github.com/ttnleipzig/regenfass/commit/0d44bf53c5718f9c45683b8f7a5c6fd8a86d712f))
* **backend:** persist Grafana config and data ([e958377](https://github.com/ttnleipzig/regenfass/commit/e958377a1f08f1c9f3d234be408c133d8ac1169f))
* **backend:** return 404 for unknown group token ([96f4f6a](https://github.com/ttnleipzig/regenfass/commit/96f4f6a05b498bd40dd0ca560f7fed32152f5385))
* **backend:** types  in db ([cdfa061](https://github.com/ttnleipzig/regenfass/commit/cdfa061f1483484139c32b89d4e2651a8408769f))
* **brand:** improve secondary button light-mode contrast ([#29](https://github.com/ttnleipzig/regenfass/issues/29)) ([d5f1d25](https://github.com/ttnleipzig/regenfass/commit/d5f1d250b2812cf550f6a1f16443f86d577665f9))
* **ci:** add explicit permissions to analyze-static-datadog workflow ([fe29e46](https://github.com/ttnleipzig/regenfass/commit/fe29e4627d09305809d55b57729dc106537d558b))
* **ci:** build web apps on GitHub and deploy to Netlify ([851a933](https://github.com/ttnleipzig/regenfass/commit/851a9330fce4f14f5c2c3d089223bdcb77b6740f))
* **ci:** clear installer markdownlint and coverage gate ([7bfdba0](https://github.com/ttnleipzig/regenfass/commit/7bfdba034268a7139c22f484547423ec4cf2f2e0))
* **ci:** enable pages setup for installer deploy ([bc645e9](https://github.com/ttnleipzig/regenfass/commit/bc645e94541cd03b6e4f2dd3e3a2daf94d988e14))
* **ci:** pass Netlify CLI --filter for monorepo deploys ([b631325](https://github.com/ttnleipzig/regenfass/commit/b631325454b3596dc4f1aa15b21ea4c39aaea176))
* **ci:** read Netlify secrets from production environment ([4562bb7](https://github.com/ttnleipzig/regenfass/commit/4562bb7ff97ee765863a8fea98ed8305a3b75936))
* **ci:** read Netlify site IDs from repository variables ([30b3be5](https://github.com/ttnleipzig/regenfass/commit/30b3be58fedd0603431f2fb781696fcf7e89c83b))
* **ci:** remove pages auto-enable and guard datadog secrets ([108a2d2](https://github.com/ttnleipzig/regenfass/commit/108a2d29d6c5f9ab36b08bce21df98d765f75d95))
* **ci:** stop enabling pages during deploy run ([d564d2e](https://github.com/ttnleipzig/regenfass/commit/d564d2e6109bf06039d525b0d98b4c734665b312))
* **ci:** upload installer dist directory for pages ([34064e9](https://github.com/ttnleipzig/regenfass/commit/34064e918984579971eeac187d687ee2c45444a6))
* **ci:** use GITHUB_TOKEN for Release Please PRs ([#21](https://github.com/ttnleipzig/regenfass/issues/21)) ([2632b55](https://github.com/ttnleipzig/regenfass/commit/2632b55ff905e37d7e6c1ad6737b1d2b10c54005))
* **ComponentRenderer.tsx:** add overflow-x-auto to prevent horizontal overflow in preview container ([5e42d35](https://github.com/ttnleipzig/regenfass/commit/5e42d3539d8ea6db929c0f1bfba964854db3b469))
* **configuration.mjs:** correct key casing for deveui, joineui, and appkey to devEUI, joinEUI, and appKey to match expected format ([4af0f94](https://github.com/ttnleipzig/regenfass/commit/4af0f941d943d59090dc988247bb0f470752612f))
* **configuration.mjs:** correct key casing for deveui, joineui, and appkey to devEUI, joinEUI, and appKey to match expected format ([21b6d32](https://github.com/ttnleipzig/regenfass/commit/21b6d32e7fbf7325236413e32ec74ee3c8074555))
* **dashboard:** remove threshold for water level ([9055deb](https://github.com/ttnleipzig/regenfass/commit/9055deb0fa42acd43d0fc255c4f2609531ff623a))
* **docs:** resolve all 132 markdownlint errors ([0ba938c](https://github.com/ttnleipzig/regenfass/commit/0ba938cd4463264d000f8cb434fb16c67fc06f5c))
* **firmware:** crash on startup without config ([58d30af](https://github.com/ttnleipzig/regenfass/commit/58d30af77a9f595f6cd4c5ffca8eeda4af8a9306))
* **frontend:** unflashed devices cause flasher to fail at load ([48163df](https://github.com/ttnleipzig/regenfass/commit/48163df1fd2e03a1b3687236c6f68aae900997dd))
* Get LoRa to Send Something ([6763174](https://github.com/ttnleipzig/regenfass/commit/6763174548f097bbdb57a70cfb9aed9aa25c141e))
* **icons:** replace react icons with solid-icons for consistency ([9915183](https://github.com/ttnleipzig/regenfass/commit/9915183e4478a5a1189948d70950009fd194d54d))
* **installer-deploy.yml:** remove redundant cache-dependency-path configuration to prevent potential caching issues ([86b7bcc](https://github.com/ttnleipzig/regenfass/commit/86b7bcc396ab2e77dc72b4834d45c05d5084fe13))
* **installer-deploy.yml:** remove redundant cache-dependency-path configuration to prevent potential caching issues ([0973f1e](https://github.com/ttnleipzig/regenfass/commit/0973f1ed4868e3f5d653452421bda5867ceb767a))
* **installer:** background is being cut off ([9cbdcb8](https://github.com/ttnleipzig/regenfass/commit/9cbdcb8268c5b7ce799aceacc975f9a039ceff60))
* **installer:** correct file paths and improve documentation consistency ([cfed260](https://github.com/ttnleipzig/regenfass/commit/cfed2605f3e35db2ffb0165166e47351db2f493c))
* **installer:** disable configure button when firmware isn't already installed ([4a8ed6e](https://github.com/ttnleipzig/regenfass/commit/4a8ed6e8b7d08f0fb69f102e18b567dd12b2744f))
* **installer:** fix TypeScript errors in source files and tests ([4482bcf](https://github.com/ttnleipzig/regenfass/commit/4482bcf9534735d68cd3325cc30d448d3b2e1f14))
* **installer:** handle ts-morph type literal checks ([3fd3f98](https://github.com/ttnleipzig/regenfass/commit/3fd3f9803152cb735462705678938f4ee7e3731e))
* **installer:** joinEUI isn't a valid config key ([c947468](https://github.com/ttnleipzig/regenfass/commit/c9474684c1127ac450a7e173a891649dacd9ad52))
* **installer:** joinEUI isn't a valid config key ([ee598ff](https://github.com/ttnleipzig/regenfass/commit/ee598ff21e474dc3d300ce00db90be4f9e50c45d))
* **installer:** less noisy logging ([f5e4db1](https://github.com/ttnleipzig/regenfass/commit/f5e4db143e1575c55b11e6f8fb229a5dbd318d96))
* **installer:** optimize icon loading in dev server ([1184ccb](https://github.com/ttnleipzig/regenfass/commit/1184ccb3ad4d388bdb1deb8926c9c93b2a8d868c))
* **installer:** properly switch to "WaitingForInstallationMethodChoice" stage after reading version ([5aa543f](https://github.com/ttnleipzig/regenfass/commit/5aa543f0dacbcc3b93ff2143edbe7846e0f754c8))
* **marketing:** sync dark mode on first paint ([#28](https://github.com/ttnleipzig/regenfass/issues/28)) ([7ff12af](https://github.com/ttnleipzig/regenfass/commit/7ff12af600d85c535d4a827d6b8dcc07fe80f0c2))
* missing space in footer ([99b6eb5](https://github.com/ttnleipzig/regenfass/commit/99b6eb58dd44087a81453a953edd95e2584a1da6))
* **PixelRuler.tsx:** improve container reference handling and cleanup logic ([e0e3a8f](https://github.com/ttnleipzig/regenfass/commit/e0e3a8fe2ce49afc753981cac3db3282941def90))
* **playground:** update documentation link and remove viewport controls ([35e5fcc](https://github.com/ttnleipzig/regenfass/commit/35e5fcc82a1e3dbf995cbf2678c6634cdc72bf58))
* **registry.json:** reorder organisms section to maintain alphabetical order ([11f9400](https://github.com/ttnleipzig/regenfass/commit/11f94008c3a6ec90df9c4f76681de59f84f75272))
* **release:** sync firmware version with Release Please ([#16](https://github.com/ttnleipzig/regenfass/issues/16)) ([b00b3f6](https://github.com/ttnleipzig/regenfass/commit/b00b3f6228a2a348c1fd113e2c34d6220c1227a5))
* **release:** use manifest as single version source ([#26](https://github.com/ttnleipzig/regenfass/issues/26)) ([a55836a](https://github.com/ttnleipzig/regenfass/commit/a55836a39296187db0502d7b69029df4ceaf00db))
* resolve merge conflicts with origin/main ([6a798c1](https://github.com/ttnleipzig/regenfass/commit/6a798c1434880c1c52e8672ce35a7cff90a405fe))
* **scp.ts:** handle case where reader is undefined to prevent errors ([43d12ff](https://github.com/ttnleipzig/regenfass/commit/43d12ff34d1ec192a2f8b7e232628d7e6c8f4300))
* **serial.mjs:** uncomment setStatusIndicator call to update status on data write ([0a5f741](https://github.com/ttnleipzig/regenfass/commit/0a5f74134676a361178f54899e2092275a49a369))
* **serial.mjs:** uncomment setStatusIndicator call to update status on data write ([4ee60a8](https://github.com/ttnleipzig/regenfass/commit/4ee60a83cb7915813b04edd88f08ecc5ce33b15d))
* **serial.mjs:** update references to buttonConfigurationConnect for better clarity and functionality ([6cd7801](https://github.com/ttnleipzig/regenfass/commit/6cd7801542748afd6440587e63ebbfe42fd644a9))
* **serial.mjs:** update references to buttonConfigurationConnect for better clarity and functionality ([925cd8a](https://github.com/ttnleipzig/regenfass/commit/925cd8ac28a2d4fc133dd73987222f453c22c767))
* some UI stuff ([6e689f4](https://github.com/ttnleipzig/regenfass/commit/6e689f4b80d79ee72e0adfa6e14a0ea9f9f5944a))
* **soundPreference.ts:** change default sound preference to disabled for better user experience ([528da23](https://github.com/ttnleipzig/regenfass/commit/528da2303cf4cd2b96c38da3a33ed5824be2c411))
* **state.ts:** conditionally log SCP parse errors in development mode to reduce noise in production logs ([0ebf57c](https://github.com/ttnleipzig/regenfass/commit/0ebf57c25349952acf400c59cb3ec0d7d71ec5a8))
* **state.ts:** correct type definitions for ReadableStream and its reader ([5c4319e](https://github.com/ttnleipzig/regenfass/commit/5c4319e3aed3314f65e67edcc729600b8238f281))
* **state.ts:** correct typo in devEUI key to ensure proper configuration handling ([0ebf57c](https://github.com/ttnleipzig/regenfass/commit/0ebf57c25349952acf400c59cb3ec0d7d71ec5a8))
* **tsconfig.node.json:** add 'node' to types to ensure node types are available ([6fbe3b6](https://github.com/ttnleipzig/regenfass/commit/6fbe3b6ffea482755693186e78ffa69327fd44df))
* **workflow:** remove redundant deployment name from sketch-release.yml ([5367419](https://github.com/ttnleipzig/regenfass/commit/5367419b171deb00cd163d587559626fabc51c3d))
* **workflow:** remove unnecessary newline in sketch-release.yml ([503799e](https://github.com/ttnleipzig/regenfass/commit/503799e5b4553da649bf4e480ad29ea9b693b379))
* **workflows:** update project URL in organize-project.yml to include specific project ID ([92ee6dd](https://github.com/ttnleipzig/regenfass/commit/92ee6dd8e68b9813fe9fbef2fb0318731fe17a97))


### Performance Improvements

* **state.ts:** remove unnecessary console log for version to clean up output ([0ebf57c](https://github.com/ttnleipzig/regenfass/commit/0ebf57c25349952acf400c59cb3ec0d7d71ec5a8))


### Miscellaneous Chores

* release 0.0.1 ([9b82a26](https://github.com/ttnleipzig/regenfass/commit/9b82a269653a6942bbee435c4e36a5e8c4169d70))
* release 0.0.1 ([b7fd90b](https://github.com/ttnleipzig/regenfass/commit/b7fd90b22a9c8959769b3a0a2f56d007f51345db))
* release 0.0.1 ([d6eff0b](https://github.com/ttnleipzig/regenfass/commit/d6eff0b8571e3a273fa3498cad58d8a26fb99863))
* release 0.0.1 ([adccb62](https://github.com/ttnleipzig/regenfass/commit/adccb625d8f39948c084eb6508926aa11b5013cc))
* release 0.0.1 ([2e6b60c](https://github.com/ttnleipzig/regenfass/commit/2e6b60cfa6c587565035174bfc344dae73815446))
* release 0.0.1 ([09775f3](https://github.com/ttnleipzig/regenfass/commit/09775f3a1c3e3194cda7a81ee93121a14d41a762))
* release 0.0.1 ([c913ce1](https://github.com/ttnleipzig/regenfass/commit/c913ce1ebb246ef0ae098ef8892e888e2d78d7b4))
* release 0.0.1 ([072af76](https://github.com/ttnleipzig/regenfass/commit/072af76e36f45cb923a1763479f2823eaca25dd1))
* release 0.0.1 ([476b1a1](https://github.com/ttnleipzig/regenfass/commit/476b1a15b2a47bc2c835e9264004c4a99636b40d))
* release 0.0.1 ([3824c67](https://github.com/ttnleipzig/regenfass/commit/3824c67ff5d06b0ddfb4a559a4444075d05a5ff7))
* release 0.0.1 ([2ea0ab6](https://github.com/ttnleipzig/regenfass/commit/2ea0ab6aa92ad46e89716992e3005392a6db649b))
* release 0.0.1 ([2235777](https://github.com/ttnleipzig/regenfass/commit/2235777cdedb1c74411181e2c09a2c326d462046))
* release 0.0.1 ([ba64430](https://github.com/ttnleipzig/regenfass/commit/ba64430600783fb6f880de8f87bcaa9dd3ded23c))
* release 0.0.1 ([903dcea](https://github.com/ttnleipzig/regenfass/commit/903dcea9d8314c53bcfc1fbafa8e41fd27d56e4f))
* release 0.0.1 ([9439b10](https://github.com/ttnleipzig/regenfass/commit/9439b10b44b4413ba687a5865f97f9d3504fb55e))
* release 0.0.1 ([5711155](https://github.com/ttnleipzig/regenfass/commit/5711155fbed19ea19db73db413a8e775a88145b9))


### Code Refactoring

* reimplement web flasher WIP ([9ffb7bc](https://github.com/ttnleipzig/regenfass/commit/9ffb7bcbe0a108baf96d070ce26b6267c865b8f8))

## [0.1.0](https://github.com/ttnleipzig/regenfass/compare/v0.0.2...v0.1.0) (2024-02-06)


### Features

* Add installation web page ([e0cbf4c](https://github.com/ttnleipzig/regenfass/commit/e0cbf4cfaf9559abe53b56a6116d12e469862eee))

## [0.0.2](https://github.com/ttnleipzig/regenfass/compare/v0.0.1...v0.0.2) (2024-01-13)


### Bug Fixes

* Get LoRa to Send Something ([adf0532](https://github.com/ttnleipzig/regenfass/commit/adf05322a41812dce6180033f9ecc52c1fd52781))

## [0.0.1](https://github.com/ttnleipzig/regenfass/compare/v0.1.6...v0.0.1) (2024-01-11)


### Features

* Add release please for automated release pull requests and releases ([bfe9f90](https://github.com/ttnleipzig/regenfass/commit/bfe9f90e913d41d1fe2c34259ab5153d55535584))
* Add release please for automatic release pull requests, release pages and upload of artifacts ([dc40b4d](https://github.com/ttnleipzig/regenfass/commit/dc40b4d0e25103119b6324f691e650665a21a7d6))
* **lora-wan:** Add LoraWAN functionality ([0e63012](https://github.com/ttnleipzig/regenfass/commit/0e63012b8df0689e2d4ee47c22b7b333e8823637))


### Bug Fixes

* **#11:** List artefacts before upload ([fb469fb](https://github.com/ttnleipzig/regenfass/commit/fb469fba9c583ad8d9783f46fd6cf24233329f9d))
* **#11:** List artefacts before upload exactly ([0814d51](https://github.com/ttnleipzig/regenfass/commit/0814d5174575e61d8e192af23a418a21e219c638))
* **#11:** List artefacts before upload exactly with package names ([f26a726](https://github.com/ttnleipzig/regenfass/commit/f26a7268a2f6b2c1b8a71d2d002acc64b175f134))
* **#11:** List artefacts before upload exactly with package names with name ([1f5a553](https://github.com/ttnleipzig/regenfass/commit/1f5a55362a4204773972eca8bc93788977b89eee))
* **#11:** try to download the artifact before upload it ([cf29939](https://github.com/ttnleipzig/regenfass/commit/cf29939803aaa3866e61fa33288635d4036625cd))
* **#11:** Use different way to upload the artifacts ([22644cd](https://github.com/ttnleipzig/regenfass/commit/22644cd8a5080bedae2349a0184f6d9a64622097))
* **#11:** Use uploads to release pages ([e192327](https://github.com/ttnleipzig/regenfass/commit/e192327acd3badfe80932ccc133db0e68f70b99f))
* **#11:** Use uploads to release pages dirk ([b9afdb6](https://github.com/ttnleipzig/regenfass/commit/b9afdb61a2d1a236a30abe6819050c5f494ef09a))
* **#11:** Use uploads to release pages firmaware ([96b2bc3](https://github.com/ttnleipzig/regenfass/commit/96b2bc3f148cb272c61f1509741a8c61e2135f66))
* **#9:** Add hint how to contribute ([bf9eb16](https://github.com/ttnleipzig/regenfass/commit/bf9eb16f8ed14b1d1559fd5f722e5887ecc33eea))
* **#9:** Add new line ([dab64b1](https://github.com/ttnleipzig/regenfass/commit/dab64b175c516d308f34e96bbc5516ca32c1b4c8))


### Miscellaneous Chores

* release 0.0.1 ([dd2830a](https://github.com/ttnleipzig/regenfass/commit/dd2830a0009badd65b0d1210a616e791b0fac965))
* release 0.0.1 ([18e77a2](https://github.com/ttnleipzig/regenfass/commit/18e77a23a2dc7b1ff05f97c34d24dc9122f90fef))

## [0.1.6](https://github.com/ttnleipzig/regenfass/compare/v0.1.5...v0.1.6) (2024-01-11)


### Bug Fixes

* **#11:** Use uploads to release pages firmaware ([96b2bc3](https://github.com/ttnleipzig/regenfass/commit/96b2bc3f148cb272c61f1509741a8c61e2135f66))

## [0.1.5](https://github.com/ttnleipzig/regenfass/compare/v0.1.4...v0.1.5) (2024-01-11)


### Bug Fixes

* **#11:** Use uploads to release pages dirk ([b9afdb6](https://github.com/ttnleipzig/regenfass/commit/b9afdb61a2d1a236a30abe6819050c5f494ef09a))

## [0.1.4](https://github.com/ttnleipzig/regenfass/compare/v0.1.3...v0.1.4) (2024-01-11)


### Bug Fixes

* **#11:** Use uploads to release pages ([e192327](https://github.com/ttnleipzig/regenfass/commit/e192327acd3badfe80932ccc133db0e68f70b99f))

## [0.1.3](https://github.com/ttnleipzig/regenfass/compare/v0.1.2...v0.1.3) (2024-01-11)


### Bug Fixes

* **#11:** List artefacts before upload exactly with package names ([f26a726](https://github.com/ttnleipzig/regenfass/commit/f26a7268a2f6b2c1b8a71d2d002acc64b175f134))
* **#11:** List artefacts before upload exactly with package names with name ([1f5a553](https://github.com/ttnleipzig/regenfass/commit/1f5a55362a4204773972eca8bc93788977b89eee))

## [0.1.2](https://github.com/ttnleipzig/regenfass/compare/v0.1.1...v0.1.2) (2024-01-11)


### Bug Fixes

* **#11:** List artefacts before upload exactly ([0814d51](https://github.com/ttnleipzig/regenfass/commit/0814d5174575e61d8e192af23a418a21e219c638))

## [0.1.1](https://github.com/ttnleipzig/regenfass/compare/v0.1.0...v0.1.1) (2024-01-11)


### Bug Fixes

* **#11:** List artefacts before upload ([fb469fb](https://github.com/ttnleipzig/regenfass/commit/fb469fba9c583ad8d9783f46fd6cf24233329f9d))

## [0.1.0](https://github.com/ttnleipzig/regenfass/compare/v0.0.2...v0.1.0) (2024-01-11)


### Features

* Add release please for automated release pull requests and releases ([bfe9f90](https://github.com/ttnleipzig/regenfass/commit/bfe9f90e913d41d1fe2c34259ab5153d55535584))


### Bug Fixes

* **#11:** try to download the artifact before upload it ([cf29939](https://github.com/ttnleipzig/regenfass/commit/cf29939803aaa3866e61fa33288635d4036625cd))

## [0.0.2](https://github.com/ttnleipzig/regenfass/compare/v0.0.1...v0.0.2) (2024-01-10)


### Bug Fixes

* **#11:** Use different way to upload the artifacts ([22644cd](https://github.com/ttnleipzig/regenfass/commit/22644cd8a5080bedae2349a0184f6d9a64622097))

## 0.0.1 (2024-01-10)


### Features

* **lora-wan:** Add LoraWAN functionality ([0e63012](https://github.com/ttnleipzig/regenfass/commit/0e63012b8df0689e2d4ee47c22b7b333e8823637))


### Bug Fixes

* **#9:** Add hint how to contribute ([bf9eb16](https://github.com/ttnleipzig/regenfass/commit/bf9eb16f8ed14b1d1559fd5f722e5887ecc33eea))
* **#9:** Add new line ([dab64b1](https://github.com/ttnleipzig/regenfass/commit/dab64b175c516d308f34e96bbc5516ca32c1b4c8))


### Miscellaneous Chores

* release 0.0.1 ([18e77a2](https://github.com/ttnleipzig/regenfass/commit/18e77a23a2dc7b1ff05f97c34d24dc9122f90fef))
