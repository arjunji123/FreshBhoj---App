import { Text, TextInput } from 'react-native';
import MainApp from './src/app/MainApp'

// The whole design system (spacing, type scale, layouts) is tuned against
// fixed dp values. Real devices vary wildly in their OS-level "Font size" /
// "Display size" accessibility settings — left uncapped, React Native's
// default `allowFontScaling: true` multiplies every Text/TextInput by that
// setting, which is what made everything render oversized on a real phone
// even though it looked correct on the emulator (left at 100%). Capping the
// multiplier still lets a user's preference nudge text a little without
// blowing the whole layout up.
const TextAny = Text as unknown as { defaultProps: Record<string, unknown> };
const TextInputAny = TextInput as unknown as { defaultProps: Record<string, unknown> };
TextAny.defaultProps = TextAny.defaultProps || {};
TextAny.defaultProps.maxFontSizeMultiplier = 1.2;
TextInputAny.defaultProps = TextInputAny.defaultProps || {};
TextInputAny.defaultProps.maxFontSizeMultiplier = 1.2;

const App = () => {
  return <MainApp/>;
}

export default App
