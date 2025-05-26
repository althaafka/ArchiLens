export default class GraphManager {
  private static instance: GraphManager;

  private analyticAspect: any = null;

  private constructor() {}

  public static getInstance(): GraphManager {
    if (!GraphManager.instance) {
      GraphManager.instance = new GraphManager();
    }
    return GraphManager.instance;
  }

  public setAnalyticAspect(analyticAspect: any): void {
    this.analyticAspect = analyticAspect;
  }

  public getAnalyticAspect(): any {
    return this.analyticAspect;
  }

  public reset(): void {
    this.analyticAspect = null;
  }
}