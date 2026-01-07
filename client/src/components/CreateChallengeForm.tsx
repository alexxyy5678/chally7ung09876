import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateChallenge } from "@/hooks/use-challenges";
import { insertChallengeSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sword, Users, Send } from "lucide-react";
import { motion } from "framer-motion";

// Extend the schema to ensure we coerce the amount
const formSchema = insertChallengeSchema.extend({
  amount: z.coerce.number().min(1, "Amount must be at least 1 USDC"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateChallengeForm() {
  const { mutate, isPending } = useCreateChallenge();
  const [activeTab, setActiveTab] = useState("p2p");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      challenger: "@me",
      opponent: "",
      amount: 10,
      type: "p2p",
      status: "active"
    },
  });

  function onSubmit(data: FormValues) {
    mutate({ ...data, type: activeTab });
    form.reset();
  }

  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl rounded-full -mr-8 -mt-8" />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold flex items-center text-foreground">
          <Send className="w-4 h-4 mr-2 text-secondary" />
          New Challenge
        </h3>
      </div>

      <Tabs defaultValue="p2p" onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg h-9">
          <TabsTrigger value="p2p" className="rounded-md text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
            <Sword className="w-3.5 h-3.5 mr-1.5" /> P2P Duel
          </TabsTrigger>
          <TabsTrigger value="crowd" className="rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-3.5 h-3.5 mr-1.5" /> Crowd Bet
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="challenger"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="@you" 
                      {...field} 
                      readOnly
                      className="bg-muted border-border focus:border-secondary/50 rounded-lg text-xs h-9 px-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="opponent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="@opponent" 
                      {...field} 
                      className="bg-muted border-border focus:border-secondary/50 rounded-lg text-xs h-9 px-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        {...field} 
                        className="bg-muted border-border focus:border-secondary/50 rounded-lg text-xs h-9 pr-14 pl-3"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">USDC</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {isPending ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
            ) : (
              "Deploy Challenge Onchain"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
