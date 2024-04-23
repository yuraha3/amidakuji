import { MouseEventHandler, useEffect, useState } from "react";

import Amida from "./Amida.tsx";
import { CanvasTypes, LineProps } from "./types.ts";
import {
  AMIDA_COUNT,
  VERTICAL_LINE_COUNT,
  PERCENT_OF_DRAW_LINE,
  CANVAS_WIDTH,
} from "./const.ts";
const isSuccess = (rate: number): boolean => {
  return Math.random() * 100 < rate;
};

const initLineProps = (): LineProps[] => {
  let props: LineProps[] = [];
  for (let col = 0; col < AMIDA_COUNT; col++) {
    //線を引く
    for (let row = 0; row < VERTICAL_LINE_COUNT; row++) {
      //縦線を引く
      props.push({
        x: col,
        y: row,
        type: "vertical",
      });

      //1つ前の横線を検索し、存在する場合は横線を引かない
      const hasPrevHorizontalLine = props.find((item) => {
        return (
          item.x === col - 1 && item.y === row && item.type === "horizontal"
        );
      });

      if (
        !hasPrevHorizontalLine &&
        row !== 0 &&
        col !== AMIDA_COUNT - 1 &&
        isSuccess(PERCENT_OF_DRAW_LINE)
      ) {
        //初回、最後ではない場合かつ前回横線を引いていない場合は、
        //乱数判定がtrueになった場合のみ横線を引く。
        //横線を引いたらフラグを立てる
        props.push({
          x: col,
          y: row,
          type: "horizontal",
        });
      }
    }
  }
  return props;
};

// function Amida() {
//   let loading: boolean = false;
//   const [isPlayAmida, setIsPlayAmida] = useState(false);
//   const setPlayState = (isPlay: boolean) => {
//     setIsPlayAmida(isPlay);
//   };

//   useEffect(() => {
//     if (loading) return;
//     initCanvas();
//     resetAmida();
//     loading = true;
//   }, []);
//   return (
//     <div>
//       <div>
//         <button
//           onClick={() => {
//             playAmidas(setPlayState);
//           }}
//         >
//           start
//         </button>
//         {/* todo: あみだプレイ中はリセットボタンを押せないようにする */}
//         <button onClick={resetAmida} disabled={isPlayAmida}>
//           reset
//         </button>
//       </div>
//       <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} id="canvas"></canvas>
//     </div>
//   );
// }

// export default Amida;

function AmidaContainer() {
  const [lineProps, setLineProps] = useState<LineProps[]>([]);

  const resetAmida = (canvas: CanvasTypes) => {
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    setLineProps(initLineProps());
  };

  // const _props = initLineProps();
  // setLineProps(_props);

  useEffect(() => {
    const _props = initLineProps();
    setLineProps(_props);
  }, []);
  return (
    <div>
      <Amida resetAmida={resetAmida} lineProps={lineProps} />
    </div>
  );
}

export default AmidaContainer;