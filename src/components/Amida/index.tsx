import { MouseEventHandler, useEffect, useState } from "react";
import Names from "./components/names.js";
import Results from "./components/results.js";

type LineProps = {
  x: number;
  y: number;
  type: "vertical" | "horizontal";
  isPass: boolean;
};

type AmidaPosition = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

const AMIDA_COUNT = Math.max(Names.length, Results.length);
const VERTICAL_LINE_COUNT = 30;
const VERTICAL_LINE_LENGTH = 30;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = VERTICAL_LINE_COUNT * VERTICAL_LINE_LENGTH + 100;
const LINE_DISTANCE = CANVAS_WIDTH / AMIDA_COUNT;
const OFFSET_HEIGHT = 100;
const OFFSET_LINE_POS = LINE_DISTANCE / 2;
let lineProps: LineProps[] = [];
const FONT_PROP = "24px san-serif";

const PERCENT_OF_DRAW_LINE = 50;
const PLAY_AMIDA_SPEED = 100;

const isSucess = (rate: number): boolean => {
  return Math.random() * 100 < rate;
};

//デバッグ用関数
const generateRandomHue = (): number => {
  return Math.trunc(Math.random() * 360);
};
//デバッグ用関数
const generateHue = (num: number): number => {
  if (num * 30 > 360) return 0;
  return num * 30;
};

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// TODO: x1,x2,y1,y2は線を引くときに計算する(引数をxとyのみにする)
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

const calcPos: (x: number, y: number) => AmidaPosition = (
  x: number,
  y: number
) => {
  const x1 = OFFSET_LINE_POS + x * LINE_DISTANCE;
  const y1 = OFFSET_HEIGHT + (y - 1) * VERTICAL_LINE_LENGTH;
  const x2 = OFFSET_LINE_POS + (x + 1) * LINE_DISTANCE;
  const y2 = OFFSET_HEIGHT + y * VERTICAL_LINE_LENGTH;

  const pos: AmidaPosition = {
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
  };
  return pos;
};

const drawText = (
  text: string,
  x: number,
  y: number,
  width: number,
  color: string
) => {
  const _text = text ?? "";
  //テキストを入れる
  ctx!.font = FONT_PROP;
  ctx!.textAlign = "center";
  ctx!.fillStyle = color;
  ctx?.fillText(_text, x, y, width);
};

const initCanvas = () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d");
};

const initAmida = () => {
  for (let i = 1; i <= AMIDA_COUNT; i++) {
    //名前を表示する
    const pos = calcPos(i - 1, 0);
    drawText(Names[i - 1], pos.x1, pos.y1 - 10, LINE_DISTANCE * 0.85, "black");

    //線を引く
    for (let j = 1; j <= VERTICAL_LINE_COUNT; j++) {
      const pos = calcPos(i - 1, j - 1);
      const color = `black`;
      //縦線を引く
      generateVerticalLine(ctx, pos.x1, pos.y1, pos.y2, color);
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
        isSucess(PERCENT_OF_DRAW_LINE)
      ) {
        //初回、最後ではない場合かつ前回横線を引いていない場合は、
        //乱数判定がtrueになった場合のみ横線を引く。
        //横線を引いたらフラグを立てる
        generateHorizontalLine(ctx, pos.x1, pos.x2, pos.y1, color);
        lineProps.push({
          x: i,
          y: j,
          type: "horizontal",
          isPass: false,
        });
      }
    }
    drawText(
      Results[i - 1],
      i * LINE_DISTANCE - LINE_DISTANCE / 2,
      OFFSET_HEIGHT + VERTICAL_LINE_COUNT * VERTICAL_LINE_LENGTH,
      LINE_DISTANCE * 0.85,
      "black"
    );
  }
};

const playAmida = async (id: number) => {
  let x = id;
  const hue = (360 / AMIDA_COUNT) * id;
  const lineColor = `hsl(${hue} 100 50)`;

  //名前のテキスト描写
  const namePos = calcPos(x, 0);
  drawText(
    Names[x],
    namePos.x1,
    namePos.y1 - 10,
    LINE_DISTANCE * 0.85,
    lineColor
  );

  for await (const i of [...Array(VERTICAL_LINE_COUNT)].keys()) {
    console.log(`x=${x}, i=${i}`);
    const currentPos = calcPos(x, i);

    //x,y+1の座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasHorizontalLine = lineProps.find((item) => {
      return item.x === x + 1 && item.y === i + 1 && item.type === "horizontal";
    });

    //x-1,yの座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasPrevHorizontalLine = lineProps.find((item) => {
      return item.x === x && item.y === i + 1 && item.type === "horizontal";
    });

    if (hasHorizontalLine) {
      generateHorizontalLine(
        ctx,
        currentPos.x1,
        currentPos.x2,
        currentPos.y1,
        lineColor
      );
      x = x + 1;
      console.log("cross right");
      console.log(`x=${x}, i=${i}`);
    } else if (hasPrevHorizontalLine) {
      x = x - 1;
      const newPos = calcPos(x, i);
      generateHorizontalLine(ctx, newPos.x1, newPos.x2, newPos.y1, lineColor);
      console.log("cross left");
      console.log(`x=${x}, i=${i}`);
    }

    const currentPos2 = calcPos(x, i);

    //縦線を引く
    generateVerticalLine(
      ctx,
      currentPos2.x1,
      currentPos2.y1,
      currentPos2.y2,
      lineColor
    );
    await sleep(PLAY_AMIDA_SPEED).then(() => console.log(`play${id}`));
  }
  console.log(`id: ${id}`);

  //結果のテキスト表示
  const resultPos = calcPos(x, VERTICAL_LINE_COUNT + 1);
  drawText(
    Results[x],
    resultPos.x1,
    resultPos.y1,
    LINE_DISTANCE * 0.85,
    lineColor
  );
};

const playAmidas = async (setPlay: (isPlay: boolean) => void) => {
  setPlay(true);
  const promiseAll = [];
  for (let i = 0; i < AMIDA_COUNT; i++) {
    promiseAll.push(playAmida(i));
  }
  await Promise.all(promiseAll);
  setPlay(false);
};

const redrawAmida = () => {
  canvas.width = CANVAS_WIDTH;
  lineProps = [];
  initAmida();
};

function Amida() {
  let loading: boolean = false;
  //todo: playAmida内でプレイ中かどうか管理したい
  const [isPlayAmida, setIsPlayAmida] = useState(false);
  const setPlayState = (isPlay: boolean) => {
    setIsPlayAmida(isPlay);
  };

  useEffect(() => {
    if (loading) return;
    initCanvas();
    redrawAmida();
    loading = true;
  }, []);
  return (
    <div>
      <div>
        <button
          onClick={() => {
            playAmidas(setPlayState);
          }}
        >
          start
        </button>
        {/* todo: あみだプレイ中はリセットボタンを押せないようにする */}
        <button onClick={redrawAmida} disabled={isPlayAmida}>
          reset
        </button>
      </div>
      <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} id="canvas"></canvas>
    </div>
  );
}

export default Amida;
