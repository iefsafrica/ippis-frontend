export type SalaryStructureCode =
  | "CONUASS"
  | "CONMESS"
  | "CONHESS"
  | "CONTEDISS"
  | "CONTISS"
  | "CONAFSS"
  | "CONPASS"
  | "CONPSS"
  | "CONPCASS"

export type SelectOption = {
  value: string
  label: string
}

type SalaryStructureConfig = {
  label: string
  gradeLevels: SelectOption[]
  cadres: SelectOption[]
  stepOptions?: SelectOption[]
  stepOptionsByGrade?: Record<string, SelectOption[]>
  cadreByGrade?: Record<string, string>
}

const makeRange = (count: number, prefix = "", pad = 2): SelectOption[] =>
  Array.from({ length: count }, (_, index) => {
    const value = String(index + 1).padStart(pad, "0")
    return {
      value,
      label: prefix ? `${prefix} ${value}` : value,
    }
  })

const genericGradeLevels = (count: number = 7) => makeRange(count)
const genericSteps = (count: number = 13) => makeRange(count, "Step", 1)

const conuassGradeLevels: SelectOption[] = [
  { value: "01", label: "01" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
  { value: "06", label: "06" },
  { value: "07", label: "07" },
]

const conuassCadres = [
  { value: "Graduate Librarian / Entry", label: "Graduate Librarian / Entry" },
  { value: "Assistant Lecturer", label: "Assistant Lecturer" },
  { value: "Lecturer II", label: "Lecturer II" },
  { value: "Lecturer I", label: "Lecturer I" },
  { value: "Senior Lecturer", label: "Senior Lecturer" },
  { value: "Reader / Assoc. Prof.", label: "Reader / Assoc. Prof." },
  { value: "Professor", label: "Professor" },
]

const conuassCadreByGrade = {
  "01": "Graduate Librarian / Entry",
  "02": "Assistant Lecturer",
  "03": "Lecturer II",
  "04": "Lecturer I",
  "05": "Senior Lecturer",
  "06": "Reader / Assoc. Prof.",
  "07": "Professor",
}

const conuassSteps = {
  "01": genericSteps(),
  "02": genericSteps(),
  "03": genericSteps(),
  "04": genericSteps(),
  "05": genericSteps(),
  "06": genericSteps(),
  "07": genericSteps(),
}

const contedissGradeLevels: SelectOption[] = Array.from({ length: 15 }, (_, index) => {
  const level = String(index + 1).padStart(2, "0")
  return { value: level, label: level }
})

const contedissCadres = [
  { value: "Tech. Support / Assistant", label: "Tech. Support / Assistant" },
  { value: "Clerical Officer", label: "Clerical Officer" },
  { value: "Higher Clerical Officer", label: "Higher Clerical Officer" },
  { value: "Executive Officer", label: "Executive Officer" },
  { value: "Higher Executive Officer", label: "Higher Executive Officer" },
  { value: "Senior Executive Officer", label: "Senior Executive Officer" },
  { value: "Principal Executive Officer", label: "Principal Executive Officer" },
  { value: "Chief Executive Officer", label: "Chief Executive Officer" },
  { value: "Assistant Chief Executive Officer", label: "Assistant Chief Executive Officer" },
  { value: "Chief Technologist", label: "Chief Technologist" },
  { value: "Deputy Registrar", label: "Deputy Registrar" },
  { value: "Deputy Registrar (Sr.)", label: "Deputy Registrar (Sr.)" },
  { value: "Registrar/Bursar", label: "Registrar/Bursar" },
  { value: "Deputy VC", label: "Deputy VC" },
  { value: "Vice Chancellor", label: "Vice Chancellor" },
]

const contedissCadreByGrade = {
  "01": "Tech. Support / Assistant",
  "02": "Clerical Officer",
  "03": "Higher Clerical Officer",
  "04": "Executive Officer",
  "05": "Higher Executive Officer",
  "06": "Senior Executive Officer",
  "07": "Principal Executive Officer",
  "08": "Chief Executive Officer",
  "09": "Assistant Chief Executive Officer",
  "10": "Chief Technologist",
  "11": "Deputy Registrar",
  "12": "Deputy Registrar (Sr.)",
  "13": "Registrar/Bursar",
  "14": "Deputy VC",
  "15": "Vice Chancellor",
}

const contedissSteps = Object.fromEntries(
  Array.from({ length: 15 }, (_, index) => {
    const level = String(index + 1).padStart(2, "0")
    return [level, genericSteps(15)]
  })
)

const contissGradeLevelsAlias = contedissGradeLevels
const contissCadresAlias = contedissCadres
const contissStepsAlias = contedissSteps

const conpcassGradeLevels: SelectOption[] = [
  { value: "01", label: "01" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
  { value: "06", label: "06" },
  { value: "07", label: "07" },
  { value: "08", label: "08" },
  { value: "09", label: "09" },
]

const conpcassCadres = [
  { value: "Instructor / Grad. Asst.", label: "Instructor / Grad. Asst." },
  { value: "Lecturer III / Asst. Lect.", label: "Lecturer III / Asst. Lect." },
  { value: "Lecturer II", label: "Lecturer II" },
  { value: "Lecturer I", label: "Lecturer I" },
  { value: "Senior Lecturer", label: "Senior Lecturer" },
  { value: "Principal Lecturer", label: "Principal Lecturer" },
  { value: "Chief Lecturer", label: "Chief Lecturer" },
  { value: "Chief Lecturer (Sr.)", label: "Chief Lecturer (Sr.)" },
  { value: "Chief Lecturer (Top / Lib.)", label: "Chief Lecturer (Top / Lib.)" },
]

const conpcassCadreByGrade = {
  "01": "Instructor / Grad. Asst.",
  "02": "Lecturer III / Asst. Lect.",
  "03": "Lecturer II",
  "04": "Lecturer I",
  "05": "Senior Lecturer",
  "06": "Principal Lecturer",
  "07": "Chief Lecturer",
  "08": "Chief Lecturer (Sr.)",
  "09": "Chief Lecturer (Top / Lib.)",
}

const conpcassSteps = Object.fromEntries(
  Array.from({ length: 9 }, (_, index) => {
    const level = String(index + 1).padStart(2, "0")
    return [level, genericSteps(15)]
  })
)

const structures: Record<SalaryStructureCode, SalaryStructureConfig> = {
  CONUASS: {
    label: "CONUASS",
    gradeLevels: conuassGradeLevels,
    cadres: conuassCadres,
    stepOptionsByGrade: conuassSteps,
    cadreByGrade: conuassCadreByGrade,
  },
  CONMESS: {
    label: "CONMESS",
    gradeLevels: genericGradeLevels(),
    cadres: [
      { value: "Medical Officer", label: "Medical Officer" },
      { value: "Medical Specialist", label: "Medical Specialist" },
      { value: "Consultant", label: "Consultant" },
      { value: "Dentist", label: "Dentist" },
      { value: "Pharmacist", label: "Pharmacist" },
      { value: "Radiographer", label: "Radiographer" },
      { value: "Medical Laboratory Scientist", label: "Medical Laboratory Scientist" },
    ],
    stepOptions: genericSteps(),
  },
  CONHESS: {
    label: "CONHESS",
    gradeLevels: genericGradeLevels(),
    cadres: [
      { value: "Nursing Officer", label: "Nursing Officer" },
      { value: "Midwife", label: "Midwife" },
      { value: "Pharmacist", label: "Pharmacist" },
      { value: "Medical Laboratory Scientist", label: "Medical Laboratory Scientist" },
      { value: "Radiographer", label: "Radiographer" },
      { value: "Physiotherapist", label: "Physiotherapist" },
      { value: "Community Health Officer", label: "Community Health Officer" },
      { value: "Health Information Manager", label: "Health Information Manager" },
    ],
    stepOptions: genericSteps(),
  },
  CONTEDISS: {
    label: "CONTEDISS",
    gradeLevels: contedissGradeLevels,
    cadres: contedissCadres,
    stepOptionsByGrade: contedissSteps,
    cadreByGrade: contedissCadreByGrade,
  },
  CONTISS: {
    label: "CONTISS II",
    gradeLevels: contissGradeLevelsAlias,
    cadres: contissCadresAlias,
    stepOptionsByGrade: contissStepsAlias,
    cadreByGrade: contedissCadreByGrade,
  },
  CONAFSS: {
    label: "CONAFSS",
    gradeLevels: genericGradeLevels(),
    cadres: [
      { value: "Agricultural Officer", label: "Agricultural Officer" },
      { value: "Extension Officer", label: "Extension Officer" },
      { value: "Research Officer", label: "Research Officer" },
      { value: "Senior Agricultural Officer", label: "Senior Agricultural Officer" },
      { value: "Principal Agricultural Officer", label: "Principal Agricultural Officer" },
      { value: "Chief Agricultural Officer", label: "Chief Agricultural Officer" },
    ],
    stepOptions: genericSteps(),
  },
  CONPASS: {
    label: "CONPASS",
    gradeLevels: genericGradeLevels(),
    cadres: [
      { value: "Administrative Officer", label: "Administrative Officer" },
      { value: "Executive Officer", label: "Executive Officer" },
      { value: "Principal Officer", label: "Principal Officer" },
      { value: "Assistant Director", label: "Assistant Director" },
      { value: "Deputy Director", label: "Deputy Director" },
      { value: "Director", label: "Director" },
    ],
    stepOptions: genericSteps(),
  },
  CONPSS: {
    label: "CONPSS",
    gradeLevels: genericGradeLevels(),
    cadres: [
      { value: "Administrative Staff", label: "Administrative Staff" },
      { value: "Technical Staff", label: "Technical Staff" },
      { value: "Support Staff", label: "Support Staff" },
    ],
    stepOptions: genericSteps(),
  },
  CONPCASS: {
    label: "CONPCASS",
    gradeLevels: conpcassGradeLevels,
    cadres: conpcassCadres,
    stepOptionsByGrade: conpcassSteps,
    cadreByGrade: conpcassCadreByGrade,
  },
}

export const salaryStructureOptions: SelectOption[] = [
  { value: "CONPSS", label: "CONPSS" },
  { value: "CONMESS", label: "CONMESS" },
  { value: "CONHESS", label: "CONHESS" },
  { value: "CONTISS", label: "CONTISS II" },
  { value: "CONTEDISS", label: "CONTEDISS" },
  { value: "CONAFSS", label: "CONAFSS" },
  { value: "CONPASS", label: "CONPASS" },
  { value: "CONPCASS", label: "CONPCASS" },
  { value: "CONUASS", label: "CONUASS" },
]

export const getSalaryStructureConfig = (value?: string) =>
  value && value in structures ? structures[value as SalaryStructureCode] : undefined

export const getGradeLevelOptions = (structure?: string) =>
  getSalaryStructureConfig(structure)?.gradeLevels ?? []

export const getStepOptions = (structure?: string, gradeLevel?: string) => {
  const config = getSalaryStructureConfig(structure)
  if (!config) {
    return []
  }

  if (config.stepOptionsByGrade && gradeLevel) {
    return config.stepOptionsByGrade[gradeLevel] ?? []
  }

  return config.stepOptions ?? genericSteps()
}

export const getCadreOptions = (structure?: string) =>
  getSalaryStructureConfig(structure)?.cadres ?? []

export const getCadreForGradeLevel = (structure?: string, gradeLevel?: string) => {
  const config = getSalaryStructureConfig(structure)
  if (!config?.cadreByGrade || !gradeLevel) {
    return undefined
  }

  return config.cadreByGrade[gradeLevel]
}


