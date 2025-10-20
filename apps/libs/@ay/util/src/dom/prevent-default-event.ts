export function preventDefaultEvent(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}
