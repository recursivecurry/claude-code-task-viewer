export namespace main {
	
	export class SessionInfo {
	    sessionId: string;
	    fullPath: string;
	    fileMtime: number;
	    firstPrompt: string;
	    summary: string;
	    messageCount: number;
	    created: string;
	    modified: string;
	    gitBranch: string;
	    projectPath: string;
	    isSidechain: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SessionInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.fullPath = source["fullPath"];
	        this.fileMtime = source["fileMtime"];
	        this.firstPrompt = source["firstPrompt"];
	        this.summary = source["summary"];
	        this.messageCount = source["messageCount"];
	        this.created = source["created"];
	        this.modified = source["modified"];
	        this.gitBranch = source["gitBranch"];
	        this.projectPath = source["projectPath"];
	        this.isSidechain = source["isSidechain"];
	    }
	}
	export class Task {
	    id: string;
	    subject: string;
	    description: string;
	    activeForm: string;
	    status: string;
	    blocks: string[];
	    blockedBy: string[];
	
	    static createFrom(source: any = {}) {
	        return new Task(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.subject = source["subject"];
	        this.description = source["description"];
	        this.activeForm = source["activeForm"];
	        this.status = source["status"];
	        this.blocks = source["blocks"];
	        this.blockedBy = source["blockedBy"];
	    }
	}
	export class TaskStatusCounts {
	    pending: number;
	    in_progress: number;
	    completed: number;
	
	    static createFrom(source: any = {}) {
	        return new TaskStatusCounts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pending = source["pending"];
	        this.in_progress = source["in_progress"];
	        this.completed = source["completed"];
	    }
	}
	export class Workspace {
	    id: string;
	    taskCount: number;
	    statusCounts: TaskStatusCounts;
	    hasTasks: boolean;
	    session?: SessionInfo;
	
	    static createFrom(source: any = {}) {
	        return new Workspace(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.taskCount = source["taskCount"];
	        this.statusCounts = this.convertValues(source["statusCounts"], TaskStatusCounts);
	        this.hasTasks = source["hasTasks"];
	        this.session = this.convertValues(source["session"], SessionInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

