import { describe, expect, it } from "vitest";
import { EMOTION_MAP, TREND_MAP, mapEmotion, mapTrend } from "../mappers";

describe("mappers", () => {
  it("maps known emotions to English labels", () => {
    expect(mapEmotion("قلق")).toBe("Anxious");
    expect(mapEmotion("هادئ")).toBe("Calm");
  });

  it("returns original emotion when mapping is missing", () => {
    expect(mapEmotion("غير معروف")).toBe("غير معروف");
  });

  it("exposes full emotion map", () => {
    expect(Object.keys(EMOTION_MAP)).toContain("محبط");
  });

  it("maps trend codes to English labels", () => {
    expect(mapTrend("صاعد")).toBe("Rising");
    expect(mapTrend("هابط")).toBe("Falling");
    expect(mapTrend("ثابت")).toBe("Steady");
  });

  it("returns original trend when code unknown", () => {
    expect(mapTrend("مستقر")).toBe("مستقر");
  });

  it("exposes trend dictionary entries", () => {
    expect(Object.keys(TREND_MAP)).toContain("ثابت");
    expect(Object.values(TREND_MAP).some((entry) => entry.en === "Steady")).toBe(true);
  });
});
