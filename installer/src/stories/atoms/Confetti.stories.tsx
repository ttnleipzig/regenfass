import type { Meta, StoryObj } from '@storybook/solidjs';
import Confetti from '../../components/atoms/Confetti';

const meta = {
  title: 'Atoms/Confetti',
  component: Confetti,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Ob die Confetti-Animation aktiv ist',
    },
  },
} satisfies Meta<typeof Confetti>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
  },
};

export const Inactive: Story = {
  args: {
    active: false,
  },
};
