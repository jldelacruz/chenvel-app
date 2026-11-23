import { MenuGrid } from '@/components/MenuGrid';
import { Screen } from '@/components/Screen';

export default function HomeScreen() {
  return (
    <Screen title="Home" subtitle="What would you like to do?">
      <MenuGrid />
    </Screen>
  );
}
