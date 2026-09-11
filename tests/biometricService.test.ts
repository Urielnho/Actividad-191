import { Platform } from "react-native";
import Constants from "expo-constants";
import * as LocalAuthentication from "expo-local-authentication";
import {
  authenticateUser,
  checkBiometricAvailability,
  getBiometricType,
} from "../services/biometricService";
jest.mock("expo-local-authentication", () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  getEnrolledLevelAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { appOwnership: "standalone" },
}));
beforeEach(() => {
  Object.defineProperty(Platform, "OS", {
    value: "android",
    configurable: true,
  });
  Object.defineProperty(Constants, "appOwnership", {
    value: "standalone",
    configurable: true,
  });
  jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
  jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true);
  jest
    .mocked(LocalAuthentication.supportedAuthenticationTypesAsync)
    .mockResolvedValue([1]);
  jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(3);
});
test("detects actual fingerprint, facial and iris capabilities", () => {
  expect(getBiometricType([1]).label).toBe("Huella");
  expect(getBiometricType([2]).kind).toBe("face");
  expect(getBiometricType([3]).kind).toBe("iris");
  expect(getBiometricType([]).kind).toBe("none");
});
test("does not assume an iPhone has Face ID", () => {
  Object.defineProperty(Platform, "OS", { value: "ios" });
  expect(getBiometricType([1]).label).toBe("Touch ID");
});
test("blocks Face ID inside Expo Go without invoking native authentication", async () => {
  Object.defineProperty(Platform, "OS", { value: "ios" });
  Object.defineProperty(Constants, "appOwnership", {
    value: "expo",
    configurable: true,
  });
  jest
    .mocked(LocalAuthentication.supportedAuthenticationTypesAsync)
    .mockResolvedValue([2]);
  expect((await checkBiometricAvailability()).reason).toContain(
    "Activa Face ID",
  );
  expect((await authenticateUser()).success).toBe(false);
  expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
});
test("blocks devices without enrollment", async () => {
  jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(false);
  expect((await authenticateUser()).success).toBe(false);
  expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
});
test.each([
  "user_cancel",
  "authentication_failed",
  "lockout",
  "system_cancel",
] as const)("fails closed for %s", async (error) => {
  jest
    .mocked(LocalAuthentication.authenticateAsync)
    .mockResolvedValue({ success: false, error });
  const result = await authenticateUser();
  expect(result.success).toBe(false);
  expect(result.message).toBeTruthy();
});
test("only a real success grants access and disables passcode fallback", async () => {
  jest
    .mocked(LocalAuthentication.authenticateAsync)
    .mockResolvedValue({ success: true });
  expect((await authenticateUser()).success).toBe(true);
  expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
    expect.objectContaining({ disableDeviceFallback: true, fallbackLabel: "" }),
  );
});
test("system exceptions remain locked", async () => {
  jest
    .mocked(LocalAuthentication.hasHardwareAsync)
    .mockRejectedValue(new Error("native error"));
  expect((await authenticateUser()).success).toBe(false);
});
