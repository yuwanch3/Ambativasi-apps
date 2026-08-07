import React from "react";
import { TouchableOpacity } from "react-native";
import type { TouchableOpacityProps, View } from "react-native";

import { playClick } from "../src/audio/soundManager";

type Props = TouchableOpacityProps & {
  disableSound?: boolean;
};

const SoundTouchableOpacity = React.forwardRef<View, Props>(
  function SoundTouchableOpacity(
    { onPress, disableSound, children, ...rest },
    ref,
  ) {
    return (
      <TouchableOpacity
        ref={ref}
        {...rest}
        onPress={(event) => {
          if (!disableSound) {
            playClick();
          }
          onPress?.(event);
        }}
      >
        {children}
      </TouchableOpacity>
    );
  },
);

export default SoundTouchableOpacity;
