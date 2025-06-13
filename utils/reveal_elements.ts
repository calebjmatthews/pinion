const revealElements = (elements: (HTMLElement|null|undefined)[]) => {
  elements.forEach((element) => {
    if (!element) return;
    element.classList.remove('display-none');
    element.classList.add('display-flex');
  });
  
  return true;
};

export default revealElements;