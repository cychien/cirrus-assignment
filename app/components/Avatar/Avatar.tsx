import Boring from "boring-avatars";

// https://github.com/boringdesigners/boring-avatars/issues/76
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Avatar = typeof Boring.default !== "undefined" ? Boring.default : Boring;

export { Avatar };
