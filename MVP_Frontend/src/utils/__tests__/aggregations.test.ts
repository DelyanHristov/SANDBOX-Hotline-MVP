import { describe, expect, it } from "vitest";
import {
  getP1Percentage,
  getTopEmotion,
  getTopTopic,
  getTotalInteractions,
  groupByUrgency
} from "../aggregations";
import type { InteractionRecord } from "../../types";

const now = new Date();

const buildTimestamp = (minutesAgo: number) =>
  new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

const interactionRecords: InteractionRecord[] = [
  {
    call_id: "call-1",
    redacted: {
      call_id: "call-1",
      turns: [
        { spk: "caller", t0: 0, t1: 5, text: "Sample caller text P1" },
        { spk: "agent", t0: 5, t1: 10, text: "Sample agent reply" }
      ],
      redaction_log: []
    },
    topic: {
      call_id: "call-1",
      topic: "Family Issues",
      subtopic: "Divorce",
      confidence: 0.92
    },
    emotion: {
      call_id: "call-1",
      emotion_now: "قلق",
      trend: "صاعد",
      evidence: ""
    },
    urgency: {
      call_id: "call-1",
      urgency: "P1",
      reason: "Immediate risk cues detected by the model"
    },
    metadata: {
      call_id: "call-1",
      timestamp: buildTimestamp(10),
      channel: "Call",
      region: "Riyadh",
      dialect: "Gulf Arabic",
      agent: "Agent Layla"
    }
  },
  {
    call_id: "call-2",
    redacted: {
      call_id: "call-2",
      turns: [
        { spk: "caller", t0: 0, t1: 4, text: "Sample caller text P2" },
        { spk: "agent", t0: 4, t1: 9, text: "Sample agent response" }
      ],
      redaction_log: []
    },
    topic: {
      call_id: "call-2",
      topic: "Work Stress",
      subtopic: "Workload",
      confidence: 0.81
    },
    emotion: {
      call_id: "call-2",
      emotion_now: "هادئ",
      trend: "ثابت",
      evidence: ""
    },
    urgency: {
      call_id: "call-2",
      urgency: "P2",
      reason: "Elevated distress cues present"
    },
    metadata: {
      call_id: "call-2",
      timestamp: buildTimestamp(75),
      channel: "Chat",
      region: "Eastern",
      dialect: "Eastern",
      agent: "Agent Omar"
    }
  },
  {
    call_id: "call-3",
    redacted: {
      call_id: "call-3",
      turns: [
        { spk: "caller", t0: 0, t1: 6, text: "Sample caller text P3" },
        { spk: "agent", t0: 6, t1: 12, text: "Sample agent reply" }
      ],
      redaction_log: []
    },
    topic: {
      call_id: "call-3",
      topic: "General Anxiety",
      subtopic: "Shift Work",
      confidence: 0.76
    },
    emotion: {
      call_id: "call-3",
      emotion_now: "حزين",
      trend: "هابط",
      evidence: ""
    },
    urgency: {
      call_id: "call-3",
      urgency: "P3",
      reason: "Routine support request"
    },
    metadata: {
      call_id: "call-3",
      timestamp: buildTimestamp(180),
      channel: "Call",
      region: "Makkah",
      dialect: "Hijazi",
      agent: "Agent Sara"
    }
  }
];

describe("aggregations", () => {
  it("computes total interactions", () => {
    expect(getTotalInteractions(interactionRecords)).toBe(
      interactionRecords.length
    );
  });

  it("calculates P1 percentage", () => {
    const pct = getP1Percentage(interactionRecords);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it("derives top emotion with English label", () => {
    const topEmotion = getTopEmotion(interactionRecords);
    expect(topEmotion.emotion).toBeTruthy();
    expect(topEmotion.trend).toBeDefined();
  });

  it("derives top topic", () => {
    expect(getTopTopic(interactionRecords)).toBeTypeOf("string");
  });

  it("groups interactions by urgency levels", () => {
    const groups = groupByUrgency(interactionRecords);
    expect(groups.P1.every((item) => item.urgency.urgency === "P1")).toBe(true);
    expect(groups.P2.every((item) => item.urgency.urgency === "P2")).toBe(true);
    expect(groups.P3.every((item) => item.urgency.urgency === "P3")).toBe(true);
  });
});
