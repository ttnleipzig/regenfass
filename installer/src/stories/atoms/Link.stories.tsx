import type { Meta, StoryObj } from '@storybook/solidjs';
import Link from '../../components/atoms/Link';

const meta = {
  title: 'Atoms/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'Die URL, zu der der Link führt',
    },
    children: {
      control: 'text',
      description: 'Der Text oder Inhalt des Links',
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: 'https://example.com',
    children: 'Beispiel Link',
  },
};

export const External: Story = {
  args: {
    href: 'https://github.com',
    children: 'GitHub (externer Link)',
  },
};

export const Internal: Story = {
  args: {
    href: '/about',
    children: 'Über uns (interner Link)',
  },
};
