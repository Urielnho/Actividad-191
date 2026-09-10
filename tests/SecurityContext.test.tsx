import React, { useLayoutEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { SecurityProvider, useSecurity } from "../context/SecurityContext";
import {
  authenticateUser,
  checkBiometricAvailability,
} from "../services/biometricService";
jest.mock("../services/biometricService", () => ({
  authenticateUser: jest.fn(),
  checkBiometricAvailability: jest.fn(),
}));
let security: ReturnType<typeof useSecurity>;
let listener: (state: AppStateStatus) => void;
let tree: ReactTestRenderer;
function Probe() {
  const value = useSecurity();
  useLayoutEffect(() => {
    security = value;
  }, [value]);
  return null;
}
async function changeState(state: AppStateStatus) {
  await act(async () => {
    Object.defineProperty(AppState, "currentState", {
      value: state,
      configurable: true,
    });
    listener(state);
  });
}
beforeEach(async () => {
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    configurable: true,
  });
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_event, callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });
  jest
    .mocked(checkBiometricAvailability)
    .mockResolvedValue({
      available: true,
      enrolled: true,
      kind: "fingerprint",
      label: "Huella",
      level: 3,
    });
  jest.mocked(authenticateUser).mockResolvedValue({ success: true });
  await act(async () => {
    tree = create(
      <SecurityProvider>
        <Probe />
      </SecurityProvider>,
    );
  });
});
afterEach(async () => {
  await act(async () => tree.unmount());
  jest.restoreAllMocks();
});
test("starts locked and unlock never bypasses the biometric service", async () => {
  expect(security.isLocked).toBe(true);
  jest
    .mocked(authenticateUser)
    .mockResolvedValue({ success: false, message: "Cancelado" });
  await act(async () => {
    expect(await security.unlock()).toBe(false);
  });
  expect(security.isLocked).toBe(true);
});
test.each(["inactive", "background"] as const)(
  "covers private content on %s and remains locked on return",
  async (state) => {
    await act(async () => {
      await security.authenticate();
    });
    expect(security.isAuthenticated).toBe(true);
    const previous = security.session;
    await changeState(state);
    expect(security.isLocked).toBe(true);
    expect(security.session).toBeGreaterThan(previous);
    await changeState("active");
    expect(security.isLocked).toBe(true);
  },
);
test("manual lock invalidates a successful result that arrives late", async () => {
  let finish!: (value: { success: boolean }) => void;
  jest.mocked(authenticateUser).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let attempt!: Promise<boolean>;
  await act(async () => {
    attempt = security.authenticate();
  });
  await act(async () => {
    security.lock();
    finish({ success: true });
    await attempt;
  });
  expect(security.isLocked).toBe(true);
});
test("backgrounding invalidates a pending biometric result", async () => {
  let finish!: (value: { success: boolean }) => void;
  jest.mocked(authenticateUser).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let attempt!: Promise<boolean>;
  await act(async () => {
    attempt = security.authenticate();
  });
  await changeState("background");
  await changeState("active");
  await act(async () => {
    finish({ success: true });
    await attempt;
  });
  expect(security.isLocked).toBe(true);
});
test("native inactive biometric sheet stays covered until successful verification", async () => {
  await act(async () => {
    await security.authenticate();
  });
  let finish!: (value: { success: boolean }) => void;
  jest.mocked(authenticateUser).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let attempt!: Promise<boolean>;
  await act(async () => {
    attempt = security.verify();
  });
  await changeState("inactive");
  expect(security.isLocked).toBe(true);
  await changeState("active");
  expect(security.isLocked).toBe(true);
  await act(async () => {
    finish({ success: true });
    expect(await attempt).toBe(true);
  });
  expect(security.isAuthenticated).toBe(true);
});
