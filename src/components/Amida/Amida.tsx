import { useState, useEffect, useRef } from "react";
import Names from "./components/names.js";
import Results from "./components/results.js";
import {
  FONT_PROP,
  AMIDA_COUNT,
  LINE_DISTANCE,
  VERTICAL_LINE_COUNT,
  PLAY_AMIDA_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  OFFSET_HEIGHT,
  OFFSET_WIDTH,
  VERTICAL_LINE_LENGTH,
  PERCENT_OF_DRAW_LINE,
} from "./const.ts";
import { LineProps, AmidaPosition, CanvasTypes } from "./types.ts";

type CtxTypes = CanvasRenderingContext2D | null;

// 横線を引く時は(x1,y1)から(x2,y1)に線を引く
// 縦線を引く時は(x1,y1)から(x1,y2)に線を引く
const calcPos: (x: number, y: number) => AmidaPosition = (
  x: number,
  y: number
) => {
  const x1 = OFFSET_WIDTH + x * LINE_DISTANCE;
  const y1 = OFFSET_HEIGHT + (y - 1) * VERTICAL_LINE_LENGTH;
  const x2 = OFFSET_WIDTH + (x + 1) * LINE_DISTANCE;
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
  ctx: CtxTypes,
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
  ctx: CtxTypes,
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
  ctx: CtxTypes,
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

const playAmida = async (ctx: CtxTypes, id: number, lineProps: LineProps[]) => {
  let row = id;
  const hue = (360 / AMIDA_COUNT) * id;
  const lineColor = `hsla(${hue}, 100%, 50%, 1.0)`;

  //名前のテキスト描写
  const namePos = calcPos(row, 0);
  drawText(
    ctx,
    Names[row],
    namePos.x1,
    namePos.y1 - 10,
    LINE_DISTANCE * 0.85,
    lineColor
  );

  for await (const col of [...Array(VERTICAL_LINE_COUNT)].keys()) {
    const currentPos = calcPos(row, col);

    //x,y+1の座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasHorizontalLine = lineProps.find((item) => {
      return item.x === row && item.y === col && item.type === "horizontal";
    });

    //x-1,yの座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasPrevHorizontalLine = lineProps.find((item) => {
      return item.x === row - 1 && item.y === col && item.type === "horizontal";
    });

    if (hasHorizontalLine) {
      generateHorizontalLine(
        ctx,
        currentPos.x1,
        currentPos.x2,
        currentPos.y1,
        lineColor
      );
      row = row + 1;
    } else if (hasPrevHorizontalLine) {
      row = row - 1;
      const newPos = calcPos(row, col);
      generateHorizontalLine(ctx, newPos.x1, newPos.x2, newPos.y1, lineColor);
    }

    const resultPos = calcPos(row, col);
    //縦線を引く
    generateVerticalLine(
      ctx,
      resultPos.x1,
      resultPos.y1,
      resultPos.y2,
      lineColor
    );
    await sleep(PLAY_AMIDA_SPEED);
  }

  //結果のテキスト表示
  const resultPos = calcPos(row, VERTICAL_LINE_COUNT);
  drawText(
    ctx,
    Results[row],
    resultPos.x1,
    resultPos.y2,
    LINE_DISTANCE * 0.85,
    lineColor
  );
};

const initAmida = (ctx: CtxTypes, lineProps: LineProps[]) => {
  const color = "black";

  //名前テキストを描写する
  Names.forEach((name: string, index: number) => {
    const namePos = calcPos(index, 0);
    drawText(
      ctx,
      name,
      namePos.x1,
      namePos.y1 - 10,
      LINE_DISTANCE * 0.85,
      color
    );
  });

  //結果テキストを描写する
  Results.forEach((result: string, index: number) => {
    const resultPos = calcPos(index, VERTICAL_LINE_COUNT);
    drawText(
      ctx,
      result,
      resultPos.x1,
      resultPos.y2,
      LINE_DISTANCE * 0.85,
      color
    );
  });

  lineProps.forEach((props: LineProps) => {
    // const color = `hsl(${generateRandomHue()} 50 50)`;
    const color = "black";
    //線を引く
    const pos = calcPos(props.x, props.y);
    if (props.type === "vertical") {
      // 縦
      generateVerticalLine(ctx, pos.x1, pos.y1, pos.y2, color);
    } else {
      // 横
      generateHorizontalLine(ctx, pos.x1, pos.x2, pos.y1, color);
    }
  });
};

const playAmidas = async (
  ctx: CtxTypes,
  setPlay: (isPlay: boolean) => void,
  lineProps: LineProps[]
) => {
  setPlay(true);
  const promiseAll = [];
  for (let i = 0; i < AMIDA_COUNT; i++) {
    //名前が入ってない場合はあみだプレイしない
    if (!Names[i]) continue;
    promiseAll.push(playAmida(ctx, i, lineProps));
  }
  await Promise.all(promiseAll);
  setPlay(false);
};

type AmidaProps = {
  resetAmida: (canvas: CanvasTypes) => void;
  lineProps: LineProps[];
};

function Amida({ resetAmida, lineProps }: AmidaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlayAmida, setIsPlayAmida] = useState(false);
  const setPlayState = (isPlay: boolean) => {
    setIsPlayAmida(isPlay);
  };

  const getContext = (): CanvasRenderingContext2D => {
    const canvas: any = canvasRef.current;
    return canvas.getContext("2d");
  };

  useEffect(() => {
    initAmida(getContext(), lineProps);
  }, [lineProps]);

  return (
    <div>
      <div>
        <button
          onClick={() => {
            playAmidas(getContext(), setPlayState, lineProps);
          }}
        >
          start
        </button>
        <button
          onClick={() => {
            resetAmida(canvasRef.current);
          }}
          disabled={isPlayAmida}
        >
          reset
        </button>
      </div>
      <canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        id="canvas"
        ref={canvasRef}
      ></canvas>
    </div>
  );
}

export default Amida;
