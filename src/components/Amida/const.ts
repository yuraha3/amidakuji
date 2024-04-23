import Names from "./data/names.js";
import Results from "./data/results.js";

//todo: 設定(config画面)で変えられるようにしたい
export const AMIDA_COUNT = Math.max(Names.length, Results.length);
export const VERTICAL_LINE_COUNT = 20;
export const VERTICAL_LINE_LENGTH = 30;
export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = VERTICAL_LINE_COUNT * VERTICAL_LINE_LENGTH + 150;
export const LINE_DISTANCE = (CANVAS_WIDTH - 100) / AMIDA_COUNT;
export const OFFSET_HEIGHT = 100;
export const OFFSET_WIDTH = 100;

export const FONT_PROP = "24px san-serif";

export const PERCENT_OF_DRAW_LINE = 33;
export const PLAY_AMIDA_SPEED = 100;
