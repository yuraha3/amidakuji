import { MouseEventHandler, useEffect } from "react";
import Names from "./components/names.js";
import Results from "./components/results.js";

type LineProps = {
  x: number;
  y: number;
  type: "vertical" | "horizontal";
  isPass: boolean;
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

const AMIDA_COUNT = Math.max(Names.length, Results.length);
const VERTICAL_LINE_COUNT = 15;
const VERTICAL_LINE_LENGTH = 45;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 720;
const LINE_DISTANCE = CANVAS_WIDTH / AMIDA_COUNT;
const OFFSET_LINE_POS = LINE_DISTANCE / 2;
let lineProps: LineProps[] = [];
const FONT_PROP = "24px san-serif";

const generateRandom = (): boolean => {
  return Math.random() < 0.2;
};

//デバッグ用関数
// const generateRandomHue = (): number => {
//   console.log(Math.trunc(Math.random() * 360));
//   return Math.trunc(Math.random() * 360);
// };
// const generateHue = (num: number): number => {
//   if (num * 30 > 360) return 0;
//   return num * 30;
// };

const generateVerticalLine = (
  ctx: CanvasRenderingContext2D | null,
  x1: number,
  y1: number,
  y2: number,
  color: string
) => {
  ctx?.beginPath();
  ctx!.strokeStyle = color;
  ctx!.lineWidth = 5;
  ctx?.moveTo(x1, y1);
  ctx?.lineTo(x1, y2);
  ctx?.stroke();
};

const generateHorizontalLine = (
  ctx: CanvasRenderingContext2D | null,
  x1: number,
  x2: number,
  y1: number,
  color: string
) => {
  ctx?.beginPath();
  ctx!.strokeStyle = color;
  ctx!.lineWidth = 5;
  ctx?.moveTo(x1, y1);
  ctx?.lineTo(x2, y1);
  ctx?.stroke();
};

const initLINE_DISTANCE = (count: number) => {
  return CANVAS_WIDTH / count;
};

const initCanvas = () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d");
};

const initAmida = () => {
  for (let i = 1; i <= AMIDA_COUNT; i++) {
    //線を引く
    for (let j = 1; j <= VERTICAL_LINE_COUNT; j++) {
      const x1 = OFFSET_LINE_POS + (i - 1) * LINE_DISTANCE;
      const y1 = (j - 1) * VERTICAL_LINE_LENGTH;
      const x2 = OFFSET_LINE_POS + i * LINE_DISTANCE;
      const y2 = j * VERTICAL_LINE_LENGTH;

      //縦線を引く
      generateVerticalLine(ctx, x1, y1, y2, "black");
      lineProps.push({
        x: i,
        y: j,
        type: "vertical",
        isPass: false,
      });

      //1つ前の横線を検索し、存在する場合は横線を引かない
      const hasPrevHorizontalLine = lineProps.find((item) => {
        // console.log(item);
        return item.x === i - 1 && item.y === j && item.type === "horizontal";
      });

      if (
        !hasPrevHorizontalLine &&
        j !== 1 &&
        i !== AMIDA_COUNT &&
        generateRandom()
      ) {
        //初回、最後ではない場合かつ前回横線を引いていない場合は、
        //乱数判定がtrueになった場合のみ横線を引く。
        //横線を引いたらフラグを立てる
        generateHorizontalLine(ctx, x1, x2, y1, "black");
        console.log(i, j);
        lineProps.push({
          x: i,
          y: j,
          type: "horizontal",
          isPass: false,
        });
      }
    }
    //テキストを入れる
    ctx!.font = FONT_PROP;
    ctx?.fillText(
      Results[i - 1],
      (i - 1) * LINE_DISTANCE,
      VERTICAL_LINE_COUNT * VERTICAL_LINE_LENGTH + 32,
      LINE_DISTANCE * 0.85
    );
  }
};

const playAmida: MouseEventHandler<HTMLButtonElement> = () => {
  let x = 0;
  for (let i = 1; i <= VERTICAL_LINE_COUNT; i++) {
    console.log(`x=${x}, i=${i}`);
    const x1 = OFFSET_LINE_POS + x * LINE_DISTANCE;
    const y1 = (i - 1) * VERTICAL_LINE_LENGTH;
    const x2 = OFFSET_LINE_POS + (x + 1) * LINE_DISTANCE;
    const y2 = i * VERTICAL_LINE_LENGTH;

    //x,y+1の座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasHorizontalLine = lineProps.find((item) => {
      return item.x === x + 1 && item.y === i + 2 && item.type === "horizontal";
    });

    if (hasHorizontalLine) {
      x = x + 1;
      generateHorizontalLine(ctx, x1, x2, y1, "red");
      console.log(`x=${x}, i=${i}`);
    }

    //x-1,y+1の座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasPrevHorizontalLine = lineProps.find((item) => {
      return item.x === x - 1 && item.y === i + 1 && item.type === "horizontal";
    });

    if (hasPrevHorizontalLine) {
      x = x - 1;
      generateHorizontalLine(ctx, x1, x2, y1, "red");
      console.log(`x=${x}, i=${i}`);
    }

    //縦線を引く
    generateVerticalLine(ctx, x1, y1, y2, "red");
    console.log(`x1=${x1} x2=${x2} x=${x}, i=${i}`);
  }
};

const redrawAmida = () => {
  canvas.width = CANVAS_WIDTH;
  lineProps = [];
  initAmida();
};

function Amida() {
  let loading: boolean = false;

  useEffect(() => {
    if (loading) return;
    console.log("init");
    initCanvas();
    redrawAmida();
    loading = true;
  }, []);
  return (
    <div>
      <button onClick={playAmida}>start</button>
      <button onClick={redrawAmida}>reset</button>
      <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} id="canvas"></canvas>
    </div>
  );
}

export default Amida;
