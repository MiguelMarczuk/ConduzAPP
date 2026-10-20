import { Image } from "expo-image";

const sources = {
  home: require("../../../assets/icons/home.svg"),
  calendar: require("../../../assets/icons/calendar.svg"),
  message: require("../../../assets/icons/message.svg"),
  user: require("../../../assets/icons/user.svg"),
  search: require("../../../assets/icons/search.svg"),
  bell: require("../../../assets/icons/bell.svg"),
  heart: require("../../../assets/icons/heart.svg"),
  chevron: require("../../../assets/icons/chevron.svg"),
  back: require("../../../assets/icons/back.svg"),
  car: require("../../../assets/icons/car.svg"),
  pin: require("../../../assets/icons/pin.svg"),
  shield: require("../../../assets/icons/shield.svg"),
  edit: require("../../../assets/icons/edit.svg"),
  help: require("../../../assets/icons/help.svg"),
  logout: require("../../../assets/icons/logout.svg"),
  refresh: require("../../../assets/icons/refresh.svg"),
  lock: require("../../../assets/icons/lock.svg"),
  eye: require("../../../assets/icons/eye.svg"),
  clock: require("../../../assets/icons/clock.svg"),
  star: require("../../../assets/icons/star.svg"),
};
export type IconName = keyof typeof sources;
export function Icon({
  name,
  size = 22,
  color = "#0046DC",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <Image
      source={sources[name]}
      tintColor={color}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
