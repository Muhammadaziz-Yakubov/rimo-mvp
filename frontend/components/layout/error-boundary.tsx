"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside boundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              {this.state.error?.message || "An unexpected application error occurred inside the view boundary."}
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={this.handleRetry} className="w-full bg-[#0B7A3B] hover:bg-[#096631] text-white">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full border-zinc-200 dark:border-zinc-850"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
