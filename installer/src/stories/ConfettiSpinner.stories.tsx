import type { Meta, StoryObj } from '@storybook/solidjs';
import ConfettiSpinner from '../components/atoms/ConfettiSpinner';

const meta = {
  title: 'Atoms/ConfettiSpinner',
  component: ConfettiSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfettiSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
