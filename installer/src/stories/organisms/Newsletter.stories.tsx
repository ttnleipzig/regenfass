import type { Meta, StoryObj } from '@storybook/solidjs';
import Newsletter from '../../components/organisms/Newsletter';

const meta = {
  title: 'Organisms/Newsletter',
  component: Newsletter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Newsletter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
