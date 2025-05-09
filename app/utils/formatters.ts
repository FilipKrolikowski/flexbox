"use client";

import { State, ItemStyle } from "../types";
import { camelToDash } from "../helpers/helpers";
import { convertCssToTailwind } from "./cssTailwindConverter";

const defaultItemStyles: ItemStyle = {
  order: 0,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: "auto",
  alignSelf: "auto",
  width: "150px",
  height: "150px",
};

const filterDefaultStyles = (styles: ItemStyle): ItemStyle => {
  const filteredStyles: ItemStyle = {};
  Object.entries(styles).forEach(([key, value]) => {
    if (defaultItemStyles[key as keyof ItemStyle] !== value) {
      filteredStyles[key] = value;
    }
  });
  return filteredStyles;
};

export const formatHTML = (data: State): string => {
  const itemsHTML = data.items.map((item) => `<div class="item">${item.text}</div>`).join("\n  ");

  return `<div class="container">
  ${itemsHTML}
</div>`;
};

export const formatCSS = (data: State): string => {
  const containerCSS = Object.entries(data.container)
    .map(([key, value]) => `  ${camelToDash(key)}: ${value};`)
    .join("\n");

  const styleGroups = new Map<string, number[]>();

  data.items.forEach((item, index) => {
    const filteredStyles = filterDefaultStyles(item.styles);
    const styleSignature = JSON.stringify(filteredStyles);
    const existingGroup = styleGroups.get(styleSignature) || [];
    styleGroups.set(styleSignature, [...existingGroup, index + 1]);
  });

  const itemsCSS = Array.from(styleGroups.entries())
    .map(([styleSignature, indices]) => {
      const styles = JSON.parse(styleSignature);
      if (Object.keys(styles).length === 0) return "";

      const styleRules = Object.entries(styles)
        .map(([key, value]) => `  ${camelToDash(key)}: ${value};`)
        .join("\n");

      const selector = indices.map((index) => `.item:nth-child(${index})`).join(",\n");

      return `${selector} {
${styleRules}
}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `.container {
${containerCSS}
}${itemsCSS ? "\n\n" + itemsCSS : ""}`;
};

export const formatTailwind = (data: State): string => {
  const containerClasses = convertCssToTailwind(data.container);
  const containerTag = containerClasses ? `<div class="${containerClasses}">` : "<div>";

  const items = data.items
    .map((item) => {
      const filteredStyles = filterDefaultStyles(item.styles);
      const itemClasses = convertCssToTailwind(filteredStyles);
      return itemClasses ? `<div class="${itemClasses}">${item.text}</div>` : `<div>${item.text}</div>`;
    })
    .join("\n  ");

  return `${containerTag}
 ${items}
</div>`;
};
