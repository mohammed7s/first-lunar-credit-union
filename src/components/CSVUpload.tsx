import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  name: string;
  wallet: string;
  amount: string;
}

interface CSVUploadProps {
  onUpload: (data: Employee[]) => void;
}

export const CSVUpload = ({ onUpload }: CSVUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row and parse CSV
      const employees = lines.slice(1).map(line => {
        const [name, wallet, amount] = line.split(',').map(item => item.trim());
        return { name, wallet, amount };
      });

      onUpload(employees);
      
      toast({
        title: "CSV Uploaded Successfully",
        description: `Imported ${employees.length} employee records`,
      });
    };
    
    reader.readAsText(file);
  };

  return (
    <Card className="p-6 bg-gradient-card border-border border-dashed hover-lift">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Upload Employee List</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          Upload a CSV file containing employee names, wallet addresses, and payment amounts
        </p>
        
        <label htmlFor="csv-upload" className="cursor-pointer">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Upload className="w-4 h-4 mr-2" />
            Choose CSV File
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
        
        <p className="text-xs text-muted-foreground mt-4">
          Expected format: name, wallet_address, amount
        </p>
      </div>
    </Card>
  );
};
