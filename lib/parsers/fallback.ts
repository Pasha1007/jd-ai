import {
  SkillMatrix,
  Seniority,
  Currency,
} from "../schemas/skillMatrix.schema";

const SKILL_KEYWORDS = {
  frontend: [
    "react",
    "vue",
    "angular",
    "svelte",
    "next.js",
    "nextjs",
    "typescript",
    "javascript",
    "html",
    "css",
    "tailwind",
    "sass",
    "webpack",
    "vite",
    "redux",
    "mobx",
    "jest",
    "testing-library",
    "cypress",
  ],
  backend: [
    "node.js",
    "nodejs",
    "python",
    "django",
    "flask",
    "fastapi",
    "java",
    "spring",
    "kotlin",
    "go",
    "golang",
    "rust",
    "ruby",
    "rails",
    "php",
    "laravel",
    "c#",
    ".net",
    "express",
    "nestjs",
    "graphql",
    "rest",
    "api",
  ],
  devops: [
    "docker",
    "kubernetes",
    "k8s",
    "aws",
    "azure",
    "gcp",
    "terraform",
    "ansible",
    "jenkins",
    "gitlab",
    "github actions",
    "ci/cd",
    "nginx",
    "prometheus",
    "grafana",
    "elk",
    "linux",
    "bash",
  ],
  web3: [
    "solidity",
    "ethereum",
    "evm",
    "smart contract",
    "blockchain",
    "web3",
    "wagmi",
    "viem",
    "ethers",
    "hardhat",
    "truffle",
    "merkle",
    "staking",
    "defi",
    "nft",
    "metamask",
    "wallet",
    "dapp",
  ],
};

function extractTitle(jd: string): string {
  const titleMatch = jd.match(/^(.+?)(?:\n|$)/);
  let title = titleMatch ? titleMatch[1].trim() : "Unknown Position";
  if (title.length > 100) {
    title = title.substring(0, 100) + "...";
  }
  return title;
}

function detectSeniority(text: string): Seniority {
  const lower = text.toLowerCase();
  if (/(junior|jr\.?|entry|graduate)/i.test(lower)) return "junior";
  if (/(senior|sr\.?)/i.test(lower)) return "senior";
  if (/(lead|principal|staff|architect)/i.test(lower)) return "lead";
  if (/(mid[\s-]level|intermediate|regular)/i.test(lower)) return "mid";
  return "unknown";
}

function extractSkills(jd: string, keywords: string[]): string[] {
  return keywords.filter((kw) => {
    const pattern = new RegExp(
      `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    return pattern.test(jd);
  });
}

function extractRequirements(jd: string): {
  mustHave: string[];
  niceToHave: string[];
} {
  const mustHaveSection = jd.match(
    /(?:requirements?|must[\s-]have|required skills?)[:\s]+((?:.|\n)*?)(?=\n\n|nice[\s-]to[\s-]have|responsibilities|$)/i
  );
  const niceToHaveSection = jd.match(
    /(?:nice[\s-]to[\s-]have|bonus|preferred)[:\s]+((?:.|\n)*?)(?=\n\n|$)/i
  );

  const mustHave = mustHaveSection
    ? mustHaveSection[1]
        .split(/\n/)
        .map((s) => s.trim().replace(/^[•\-\*]\s*/, ""))
        .filter((s) => s.length > 0)
        .slice(0, 10)
    : ["Experience with relevant technologies"];

  const niceToHave = niceToHaveSection
    ? niceToHaveSection[1]
        .split(/\n/)
        .map((s) => s.trim().replace(/^[•\-\*]\s*/, ""))
        .filter((s) => s.length > 0)
        .slice(0, 10)
    : [];

  return { mustHave, niceToHave };
}

function extractSalary(jd: string): SkillMatrix["salary"] {
  const salaryMatch = jd.match(
    /(\$|€|£|PLN)\s*(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)\s*[-–]\s*(\$|€|£|PLN)?\s*(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)\s*(k|K)?/
  );

  if (!salaryMatch) return undefined;

  const symbol = salaryMatch[1];
  const min = parseFloat(salaryMatch[2].replace(/,/g, ""));
  const max = parseFloat(salaryMatch[4].replace(/,/g, ""));
  const isK = salaryMatch[5];

  let currency: Currency = "USD";
  if (symbol === "€") currency = "EUR";
  else if (symbol === "£") currency = "GBP";
  else if (symbol === "PLN") currency = "PLN";

  return {
    currency,
    min: isK ? min * 1000 : min,
    max: isK ? max * 1000 : max,
  };
}

function generateSummary(
  title: string,
  seniority: Seniority,
  skills: SkillMatrix["skills"],
  salary?: SkillMatrix["salary"]
): string {
  const skillCount = Object.values(skills).flat().length;
  const seniorityText = seniority !== "unknown" ? `${seniority}-level ` : "";
  const salaryText = salary
    ? ` with ${salary.currency} ${salary.min}-${salary.max} compensation`
    : "";

  const topSkills =
    [...skills.frontend.slice(0, 2), ...skills.backend.slice(0, 2)].join(
      ", "
    ) || "various technologies";
  const summary = `${seniorityText}${title} position requiring ${skillCount} technical skills across frontend, backend, and infrastructure${salaryText}. Key focus areas include ${topSkills}.`;

  return summary.split(" ").slice(0, 60).join(" ");
}

export function fallbackParser(jd: string): SkillMatrix {
  const title = extractTitle(jd);
  const seniority = detectSeniority(jd);

  const skills = {
    frontend: extractSkills(jd, SKILL_KEYWORDS.frontend),
    backend: extractSkills(jd, SKILL_KEYWORDS.backend),
    devops: extractSkills(jd, SKILL_KEYWORDS.devops),
    web3: extractSkills(jd, SKILL_KEYWORDS.web3),
    other: [] as string[],
  };

  const { mustHave, niceToHave } = extractRequirements(jd);
  const salary = extractSalary(jd);
  const summary = generateSummary(title, seniority, skills, salary);

  return { title, seniority, skills, mustHave, niceToHave, salary, summary };
}
