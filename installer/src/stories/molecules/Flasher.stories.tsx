import type { Meta, StoryObj } from '@storybook/solidjs';
import Flasher from '../../components/molecules/Flasher';

const meta = {
  title: 'Molecules/Flasher',
  component: Flasher,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    port: {
      control: 'text',
      description: 'Der COM-Port für das Flashing',
    },
    firmware: {
      control: 'text',
      description: 'Der Pfad zur Firmware-Datei',
    },
  },
} satisfies Meta<typeof Flasher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    port: 'COM3',
    firmware: '/firmware.bin',
  },
};

export const NoPort: Story = {
  args: {
    port: '',
    firmware: '/firmware.bin',
  },
};

export const NoFirmware: Story = {
  args: {
    port: 'COM3',
    firmware: '',
  },
};
