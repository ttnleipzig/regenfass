import type { Meta, StoryObj } from '@storybook/solidjs';
import Welcome from '../../components/organisms/Welcome';

const meta = {
  title: 'Organisms/Welcome',
  component: Welcome,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
