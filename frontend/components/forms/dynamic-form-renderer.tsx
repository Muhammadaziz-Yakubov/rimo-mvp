"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UploadCloud, Info } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { getTranslation } from "@/utils/multilang";
import { cn } from "@/lib/utils";

interface DynamicFormRendererProps {
  fields: any[];
  register: any;
  control: any;
  errors: any;
}

export function DynamicFormRenderer({
  fields,
  register,
  control,
  errors,
}: DynamicFormRendererProps) {
  
  const sortedFields = [...fields].sort((a, b) => {
    if (a.coordinateY !== b.coordinateY) {
      return a.coordinateY - b.coordinateY;
    }
    return a.coordinateX - b.coordinateX;
  });

  return (
    <div className="grid grid-cols-12 gap-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
      {sortedFields.map((field, index) => {
        if (field.isHidden) return null;

        const colSpan = field.colspan || 12;
        const fieldError = errors[field.code];
        const labelText = getTranslation(field.title, "uz");
        const placeholderText = getTranslation(field.placeholder, "uz") || "Kiriting...";

        return (
          <div
            key={`${field.code || "field"}_${index}`}
            className={cn(
              "space-y-1.5",
              colSpan === 12 && "col-span-12",
              colSpan === 6 && "col-span-12 md:col-span-6",
              colSpan === 4 && "col-span-12 md:col-span-4",
              colSpan === 3 && "col-span-12 sm:col-span-6 md:col-span-3"
            )}
          >
            {/* Headers / Labels rendering */}
            {field.type === "LabelHeader" && (
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-2 mt-4 col-span-12">
                {labelText}
              </h3>
            )}

            {field.type === "Label" && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 py-1.5">
                {labelText}
              </p>
            )}

            {/* Form Inputs rendering */}
            {(field.type === "InputString" || field.type === "InputStringLabel") && (
              <>
                <Label htmlFor={field.code} className="text-xs font-semibold">
                  {labelText} {field.isRequired && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={field.code}
                  type="text"
                  placeholder={placeholderText}
                  {...register(field.code)}
                  disabled={field.isDisabled}
                  className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-[#2563eb] text-sm"
                />
              </>
            )}

            {(field.type === "InputInteger" || field.type === "InputFloat") && (
              <>
                <Label htmlFor={field.code} className="text-xs font-semibold">
                  {labelText} {field.isRequired && <span className="text-red-500">*</span>}
                </Label>
                <Controller
                  name={field.code}
                  control={control}
                  render={({ field: numField }) => (
                    <Input
                      id={field.code}
                      type="number"
                      step={field.type === "InputFloat" ? "0.01" : "1"}
                      placeholder="0.00"
                      value={numField.value === undefined || numField.value === null || isNaN(numField.value) ? "" : numField.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        numField.onChange(val === "" ? undefined : Number(val));
                      }}
                      disabled={field.isDisabled}
                      className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-[#2563eb] text-sm"
                    />
                  )}
                />
              </>
            )}

            {(field.type === "Select" || field.type === "SelectLabel") && (
              <>
                <Label htmlFor={field.code} className="text-xs font-semibold">
                  {labelText} {field.isRequired && <span className="text-red-500">*</span>}
                </Label>
                <Controller
                  name={field.code}
                  control={control}
                  render={({ field: selectField }) => (
                    <Select
                      onValueChange={selectField.onChange}
                      value={selectField.value}
                      disabled={field.isDisabled}
                    >
                      <SelectTrigger className="border-zinc-200 dark:border-zinc-800 text-sm">
                        <SelectValue placeholder={placeholderText} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200">
                        {field.options?.map((option: any) => (
                          <SelectItem key={option.value} value={option.value} className="text-sm">
                            {option.label}
                          </SelectItem>
                        ))}
                        {(!field.options || field.options.length === 0) && (
                          <SelectItem value="default" disabled>Tanlovlar mavjud emas</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </>
            )}

            {(field.type === "DatePicker" || field.type === "DatePickerLabel") && (
              <>
                <Label htmlFor={field.code} className="text-xs font-semibold">
                  {labelText} {field.isRequired && <span className="text-red-500">*</span>}
                </Label>
                <Controller
                  name={field.code}
                  control={control}
                  render={({ field: dateField }) => (
                    <Popover>
                      <PopoverTrigger
                        disabled={field.isDisabled}
                        className={cn(
                          "w-full flex items-center justify-start text-left font-normal border border-zinc-200 dark:border-zinc-800 text-sm h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                          !dateField.value && "text-zinc-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                        {dateField.value ? formatDate(dateField.value) : placeholderText}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-900 border-zinc-200" align="start">
                        <Calendar
                          mode="single"
                          selected={dateField.value ? new Date(dateField.value) : undefined}
                          onSelect={(date) => dateField.onChange(date?.toISOString())}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </>
            )}

            {(field.type === "TextArea" || field.type === "TextAreaLabel") && (
              <>
                <Label htmlFor={field.code} className="text-xs font-semibold">
                  {labelText} {field.isRequired && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id={field.code}
                  placeholder={placeholderText}
                  {...register(field.code)}
                  disabled={field.isDisabled}
                  className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-[#0B7A3B] text-sm min-h-[80px]"
                />
              </>
            )}

            {(field.type === "Checkbox" || field.type === "CheckboxLabel") && (
              <div className="flex items-center gap-2.5 pt-2">
                <Controller
                  name={field.code}
                  control={control}
                  render={({ field: checkField }) => (
                    <Checkbox
                      id={field.code}
                      checked={!!checkField.value}
                      onCheckedChange={checkField.onChange}
                      disabled={field.isDisabled}
                      className="border-zinc-300 focus-visible:ring-[#0B7A3B]"
                    />
                  )}
                />
                <Label htmlFor={field.code} className="text-xs font-semibold cursor-pointer">
                  {labelText} {field.isRequired && <span className="text-red-500">*</span>}
                </Label>
              </div>
            )}

            {(field.type === "FileUpload" || field.type === "MultipleFileUpload") && (
              <>
                <Label className="text-xs font-semibold">{labelText}</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20 text-center cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <UploadCloud className="h-6 w-6 text-zinc-400 mb-1.5" />
                  <span className="text-xs text-zinc-500 font-medium">Fayl yuklash yoki ko'rish</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">PDF yoki XML, 5MB gacha</span>
                </div>
              </>
            )}

            {field.type === "VerifyWithEds" && (
              <div className="p-4 rounded-xl border border-[#2563eb]/20 bg-[#2563eb]/5 flex items-start gap-3 mt-2">
                <Info className="h-5 w-5 text-[#2563eb] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#2563eb]">ERI/EDS imzosi talab qilinadi</span>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    Ushbu forma rasmiy davlat EDS kaliti orqali tasdiqlashni talab qiladi. Iltimos, EDS plaginini kompyuteringizda ishga tushiring.
                  </p>
                </div>
              </div>
            )}

            {fieldError && (
              <p className="text-xs font-medium text-red-600 mt-1">
                {fieldError.message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
