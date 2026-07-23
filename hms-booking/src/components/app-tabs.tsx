import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { AppColors } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

export default function AppTabs() {
  const { t } = useLocale();

  return (
    <NativeTabs
      backgroundColor={AppColors.background}
      indicatorColor={AppColors.backgroundSelected}
      labelStyle={{ selected: { color: AppColors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('home')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>{t('explore')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="safari.fill" md="explore" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{t('profile')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
