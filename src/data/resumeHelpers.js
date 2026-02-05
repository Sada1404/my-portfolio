// Flatten skills from resume format; support both { name, icon }[] and string[]
export function getFlattenedSkillsWithIcons(skillsObj) {
  const list = [];
  Object.entries(skillsObj || {}).forEach(([, arr]) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((item) => {
      if (typeof item === "string") list.push({ name: item, icon: null });
      else if (item && typeof item.name === "string") list.push({ name: item.name, icon: item.icon || null });
    });
  });
  return list;
}
