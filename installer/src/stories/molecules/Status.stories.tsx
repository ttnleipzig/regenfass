import type { Meta, StoryObj } from '@storybook/solidjs';
import Status from '../../components/molecules/Status';

const meta = {
  title: 'Molecules/Status',
  component: Status,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['idle', 'loading', 'success', 'error'],
      description: 'Der aktuelle Status',
    },
    message: {
      control: 'text',
      description: 'Die Status-Nachricht',
    },
  },
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    status: 'idle',
    message: 'Bereit zum Start',
  },
};

export const Loading: Story = {
  args: {
    status: 'loading',
    message: 'Installation läuft...',
  },
};

export const Success: Story = {
  args: {
    status: 'success',
    message: 'Installation erfolgreich abgeschlossen!',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    message: 'Fehler bei der Installation',
  },
};
