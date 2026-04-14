export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
}

export const TOPICS = [
  { id: 'mathematics', name: 'Mathematics', icon: '📐', color: 'from-blue-500 to-cyan-400' },
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'from-purple-500 to-pink-400' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'from-green-500 to-emerald-400' },
  { id: 'programming', name: 'Programming', icon: '💻', color: 'from-orange-500 to-yellow-400' },
  { id: 'ai', name: 'Artificial Intelligence', icon: '🤖', color: 'from-violet-500 to-purple-400' },
  { id: 'ml', name: 'Machine Learning', icon: '🧠', color: 'from-pink-500 to-rose-400' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒', color: 'from-red-500 to-orange-400' },
  { id: 'data-science', name: 'Data Science', icon: '📊', color: 'from-teal-500 to-cyan-400' },
  { id: 'devops', name: 'DevOps', icon: '🚀', color: 'from-indigo-500 to-blue-400' },
  { id: 'dsa', name: 'DSA', icon: '🌳', color: 'from-amber-500 to-yellow-400' },
] as const;

export type TopicId = typeof TOPICS[number]['id'];

export const questionBank: Question[] = [
  { id: "math1", text: "What is the value of π (pi) to 2 decimal places?", options: ["3.14", "2.71", "1.62", "3.41"], correctIndex: 0, category: "mathematics", difficulty: "Easy", explanation: "π (pi) is approximately 3.14159, commonly rounded to 3.14." },
  { id: "math2", text: "What is the derivative of x²?", options: ["x", "2x", "x²", "2x²"], correctIndex: 1, category: "mathematics", difficulty: "Medium", explanation: "Using the power rule, d/dx(x²) = 2x." },
  { id: "math3", text: "What is a prime number?", options: ["Divisible by 1 and itself only", "An even number", "A negative number", "A decimal number"], correctIndex: 0, category: "mathematics", difficulty: "Easy", explanation: "A prime number has exactly two factors: 1 and itself." },
  { id: "math4", text: "What is the binary representation of 10?", options: ["1010", "1100", "1001", "0110"], correctIndex: 0, category: "mathematics", difficulty: "Medium", explanation: "10 in binary: 8+2 = 1010." },
  { id: "math5", text: "What is the Fibonacci sequence start?", options: ["0, 1, 1, 2, 3", "1, 2, 3, 4, 5", "1, 1, 2, 4, 8", "0, 2, 4, 6, 8"], correctIndex: 0, category: "mathematics", difficulty: "Easy", explanation: "Fibonacci starts with 0, 1 and each subsequent number is the sum of the two preceding ones." },
  { id: "math6", text: "What is log₂(8)?", options: ["2", "3", "4", "8"], correctIndex: 1, category: "mathematics", difficulty: "Medium", explanation: "2³ = 8, so log₂(8) = 3." },
  { id: "math7", text: "What is the square root of 144?", options: ["10", "11", "12", "14"], correctIndex: 2, category: "mathematics", difficulty: "Easy", explanation: "12 × 12 = 144." },
  { id: "math8", text: "What is 0! (zero factorial)?", options: ["0", "1", "Undefined", "Infinity"], correctIndex: 1, category: "mathematics", difficulty: "Medium", explanation: "By convention, 0! = 1. This is important for combinatorics formulas." },
  { id: "math9", text: "What is the integral of 1/x?", options: ["x", "ln|x| + C", "1/x² + C", "e^x + C"], correctIndex: 1, category: "mathematics", difficulty: "Hard", explanation: "The integral of 1/x is the natural logarithm ln|x| + C." },
  { id: "math10", text: "What is the sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correctIndex: 1, category: "mathematics", difficulty: "Easy", explanation: "The angles in any triangle always sum to 180 degrees." },
  { id: "math11", text: "What is the quadratic formula?", options: ["x = -b ± √(b²-4ac) / 2a", "x = -b / 2a", "x = b² - 4ac", "x = a² + b²"], correctIndex: 0, category: "mathematics", difficulty: "Medium", explanation: "The quadratic formula solves ax² + bx + c = 0." },
  { id: "math12", text: "What is the value of e (Euler's number) approximately?", options: ["2.718", "3.141", "1.618", "1.414"], correctIndex: 0, category: "mathematics", difficulty: "Medium", explanation: "e ≈ 2.71828, the base of natural logarithms." },
  { id: "math13", text: "What is the Pythagorean theorem?", options: ["a² + b² = c²", "a + b = c", "a² - b² = c²", "2a + 2b = c"], correctIndex: 0, category: "mathematics", difficulty: "Easy", explanation: "In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides." },
  { id: "math14", text: "What is the determinant of a 2×2 matrix [[a,b],[c,d]]?", options: ["ad + bc", "ad - bc", "ac - bd", "ab - cd"], correctIndex: 1, category: "mathematics", difficulty: "Hard", explanation: "The determinant of a 2×2 matrix is ad - bc." },
  { id: "math15", text: "What is the limit of sin(x)/x as x→0?", options: ["0", "1", "∞", "Undefined"], correctIndex: 1, category: "mathematics", difficulty: "Hard", explanation: "This is a fundamental limit in calculus: lim(x→0) sin(x)/x = 1." },
  { id: "math16", text: "How many degrees are in a radian?", options: ["About 57.3°", "About 90°", "About 45°", "About 180°"], correctIndex: 0, category: "mathematics", difficulty: "Medium", explanation: "1 radian = 180/π ≈ 57.296 degrees." },
  { id: "math17", text: "What is the GCD of 12 and 18?", options: ["3", "6", "9", "12"], correctIndex: 1, category: "mathematics", difficulty: "Easy", explanation: "The greatest common divisor of 12 and 18 is 6." },
  { id: "math18", text: "What is i² in complex numbers?", options: ["1", "-1", "i", "0"], correctIndex: 1, category: "mathematics", difficulty: "Medium", explanation: "By definition, i is the imaginary unit where i² = -1." },
  { id: "math19", text: "What is the Taylor series of e^x at x=0?", options: ["1 + x + x²/2! + x³/3! + ...", "x + x² + x³ + ...", "1 - x + x² - x³ + ...", "x - x³/3! + x⁵/5! - ..."], correctIndex: 0, category: "mathematics", difficulty: "Hard", explanation: "e^x = Σ(xⁿ/n!) for n from 0 to infinity." },
  { id: "math20", text: "What is 15% of 200?", options: ["25", "30", "35", "40"], correctIndex: 1, category: "mathematics", difficulty: "Easy", explanation: "15% × 200 = 0.15 × 200 = 30." },
  { id: "math21", text: "What is the area of a circle with radius r?", options: ["2πr", "πr²", "πd", "2πr²"], correctIndex: 1, category: "mathematics", difficulty: "Easy", explanation: "The area of a circle is πr²." },
  { id: "math22", text: "What does the notation n! represent?", options: ["n squared", "n factorial", "n prime", "nth root"], correctIndex: 1, category: "mathematics", difficulty: "Easy", explanation: "n! (n factorial) is the product of all positive integers up to n." },
  { id: "math23", text: "What is the chain rule in calculus?", options: ["d/dx[f(g(x))] = f'(g(x))·g'(x)", "d/dx[f·g] = f'g + fg'", "d/dx[f/g] = (f'g - fg')/g²", "d/dx[f+g] = f'+g'"], correctIndex: 0, category: "mathematics", difficulty: "Hard", explanation: "The chain rule states that the derivative of a composite function is the outer derivative times the inner derivative." },
  { id: "math24", text: "What is the dot product of vectors [1,2] and [3,4]?", options: ["7", "11", "10", "5"], correctIndex: 1, category: "mathematics", difficulty: "Medium", explanation: "Dot product: 1×3 + 2×4 = 3 + 8 = 11." },
  { id: "math25", text: "What is the eigenvalue equation?", options: ["Av = λv", "A + v = λ", "Av = v/λ", "A = λ + v"], correctIndex: 0, category: "mathematics", difficulty: "Hard", explanation: "The eigenvalue equation is Av = λv, where λ is the eigenvalue and v is the eigenvector." },
];

export function getQuestionsByTopic(topic: string): Question[] {
  return questionBank.filter(q => q.category === topic);
}

function shuffleOptions(question: Question): Question {
  const correctAnswer = question.options[question.correctIndex];
  const shuffled = [...question.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    ...question,
    options: shuffled,
    correctIndex: shuffled.indexOf(correctAnswer),
  };
}

export function getRandomQuestions(count: number, topic?: string): Question[] {
  const pool = topic ? getQuestionsByTopic(topic) : questionBank;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(shuffleOptions);
}

export function generateQuizCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'QZ';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getTopicQuestionCount(topic: string): number {
  return questionBank.filter(q => q.category === topic).length;
}
