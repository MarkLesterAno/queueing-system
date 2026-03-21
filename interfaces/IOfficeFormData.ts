interface IOfficeFormData {
  id: string;
  name: string;
  abbreviation: string;
  prefix: string;
  color: string;
  counters: number;
  pin: string;
}

interface IOfficeManagerProps {
  offices: any[];
  onMutate: () => void;
}